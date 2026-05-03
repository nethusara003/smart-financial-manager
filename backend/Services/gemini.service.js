const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com";
const GEMINI_API_VERSION_CANDIDATES = ["v1", "v1beta"];
const GEMINI_API_URL_TEMPLATE = `${GEMINI_API_BASE_URL}/v1/models/{model}:generateContent`;
const GEMINI_REQUEST_TIMEOUT_MS = 20000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
const GEMINI_MODEL_CANDIDATES = [
  GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.0-pro",
].filter(Boolean);
const PRIMARY_SYSTEM_PROMPT_CHARS = Number(process.env.GEMINI_PRIMARY_SYSTEM_PROMPT_CHARS || 1800);
const PRIMARY_USER_PROMPT_CHARS = Number(process.env.GEMINI_PRIMARY_USER_PROMPT_CHARS || 8500);
const RETRY_SYSTEM_PROMPT_CHARS = Number(process.env.GEMINI_RETRY_SYSTEM_PROMPT_CHARS || 900);
const RETRY_USER_PROMPT_CHARS = Number(process.env.GEMINI_RETRY_USER_PROMPT_CHARS || 2600);
const PRIMARY_MAX_TOKENS = Number(process.env.GEMINI_PRIMARY_MAX_TOKENS || 450);
const RETRY_MAX_TOKENS = Number(process.env.GEMINI_RETRY_MAX_TOKENS || 280);

const GEMINI_LIMIT_FRIENDLY_MESSAGE =
  "That request is too large for the current AI model. Please ask a shorter question or start a new chat.";

const EMPTY_USAGE = Object.freeze({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});

const createServiceError = (message, statusCode = 500) => {
  return Object.assign(new Error(message), { statusCode });
};

const normalizeUsage = (usage) => {
  if (!usage || typeof usage !== "object") {
    return { ...EMPTY_USAGE };
  }

  const promptTokens = Number.isFinite(Number(usage.prompt_tokens))
    ? Math.max(0, Number(usage.prompt_tokens))
    : 0;
  const completionTokens = Number.isFinite(Number(usage.output_tokens))
    ? Math.max(0, Number(usage.output_tokens))
    : 0;
  const totalTokens = Number.isFinite(Number(usage.total_tokens))
    ? Math.max(0, Number(usage.total_tokens))
    : promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
};

const clampText = (value, maxChars) => {
  const normalized = String(value || "").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, maxChars)}\n\n[truncated to fit model limits]`;
};

const toClientStatus = (status) => {
  if (!status) {
    return 502;
  }

  if (status >= 500) {
    return 502;
  }

  if (status === 413) {
    return 429;
  }

  return status;
};

const isCapacityError = (status, message) => {
  if (status === 429 || status === 500 || status === 503 || status === 504) {
    return true;
  }

  const normalizedMessage = String(message || "").toLowerCase();
  return (
    normalizedMessage.includes("high demand") ||
    normalizedMessage.includes("please try again later") ||
    normalizedMessage.includes("temporarily unavailable") ||
    normalizedMessage.includes("service unavailable") ||
    normalizedMessage.includes("overloaded")
  );
};

const isLimitError = (status, message) => {
  if (status === 413 || status === 429) {
    return true;
  }

  const normalizedMessage = String(message || "").toLowerCase();
  return (
    normalizedMessage.includes("request too large") ||
    normalizedMessage.includes("tokens per minute") ||
    normalizedMessage.includes("tpm") ||
    normalizedMessage.includes("context length") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("quota") ||
    normalizedMessage.includes("too many requests")
  );
};

const buildCompactRetryUserPrompt = (userPrompt) => {
  const normalized = String(userPrompt || "");
  const contextMarkerIndex = normalized.indexOf("\nContext snapshot:");

  if (contextMarkerIndex > -1) {
    const questionPart = normalized.slice(0, contextMarkerIndex).trim();
    return clampText(
      `${questionPart}\n\nContext omitted to fit model limits. Answer with concise guidance and ask for follow-up details if needed.`,
      RETRY_USER_PROMPT_CHARS
    );
  }

  return clampText(normalized, RETRY_USER_PROMPT_CHARS);
};

const normalizeModelName = (value) => String(value || "").trim().replace(/^models\//, "");

const extractSupportedModels = (payload) => {
  const models = Array.isArray(payload?.models) ? payload.models : [];

  return models
    .map((model) => ({
      name: normalizeModelName(model?.name),
      methods: Array.isArray(model?.supportedGenerationMethods)
        ? model.supportedGenerationMethods.map((method) => String(method || "").trim())
        : [],
    }))
    .filter((model) => model.name && model.methods.includes("generateContent"));
};

const fetchModelCatalog = async (apiKey) => {
  for (const version of GEMINI_API_VERSION_CANDIDATES) {
    const url = `${GEMINI_API_BASE_URL}/${version}/models?key=${apiKey}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        continue;
      }

      const models = extractSupportedModels(payload);
      if (models.length > 0) {
        return models;
      }
    } catch {
      // Try the next API version candidate.
    }
  }

  return [];
};

let cachedModelSelection = null;

const resolveGeminiModelCandidates = async (apiKey, preferredModel = GEMINI_MODEL) => {
  if (
    cachedModelSelection &&
    cachedModelSelection.apiKey === apiKey &&
    Array.isArray(cachedModelSelection.models) &&
    cachedModelSelection.models.length > 0
  ) {
    return cachedModelSelection.models;
  }

  const catalog = await fetchModelCatalog(apiKey);
  const catalogNames = new Set(catalog.map((model) => model.name));
  const preferredCandidates = [preferredModel, ...GEMINI_MODEL_CANDIDATES]
    .map(normalizeModelName)
    .filter(Boolean);

  const resolvedCandidates = [];

  for (const candidate of preferredCandidates) {
    if (catalogNames.has(candidate)) {
      resolvedCandidates.push(candidate);
    }
  }

  for (const entry of catalog) {
    if (!resolvedCandidates.includes(entry.name)) {
      resolvedCandidates.push(entry.name);
    }
  }

  if (resolvedCandidates.length === 0) {
    resolvedCandidates.push(normalizeModelName(preferredModel) || "gemini-2.0-flash");
  }

  cachedModelSelection = { apiKey, models: resolvedCandidates };
  return resolvedCandidates;
};

const callGeminiApi = async ({ apiKey, systemPrompt, userPrompt, maxTokens, preferredModel }) => {
  const model = Array.isArray(preferredModel) ? preferredModel[0] : preferredModel;
  const apiUrl = `${GEMINI_API_URL_TEMPLATE.replace("{model}", model)}?key=${apiKey}`;
  
  // Combine system prompt with user prompt since Gemini API v1 handles it differently
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
  
  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, GEMINI_REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: combinedPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: maxTokens,
        },
      }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        ok: false,
        status: 504,
        message: "Gemini API request timed out",
      };
    }

    return {
      ok: false,
      status: 502,
      message: "Failed to reach Gemini API",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Invalid response received from Gemini API",
    };
  }

  if (!response.ok) {
    const errorMessage = 
      payload?.error?.message || 
      payload?.error?.details?.[0]?.detail ||
      "Gemini API request failed";

    if (response.status === 404 && String(errorMessage).toLowerCase().includes("model")) {
      cachedModelSelection = null;
    }
    
    return {
      ok: false,
      status: response.status,
      message: errorMessage,
    };
  }

  const aiText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof aiText !== "string" || aiText.trim().length === 0) {
    return {
      ok: false,
      status: 502,
      message: "Gemini API returned an empty response",
    };
  }

  return {
    ok: true,
    reply: aiText.trim(),
    usage: normalizeUsage(payload?.usage_metadata),
    model: String(model),
  };
};

const attemptGeminiAcrossModels = async ({
  apiKey,
  systemPrompt,
  userPrompt,
  maxTokens,
  preferredModel,
}) => {
  const modelCandidates = await resolveGeminiModelCandidates(apiKey, preferredModel);

  for (const model of modelCandidates) {
    const result = await callGeminiApi({
      apiKey,
      systemPrompt,
      userPrompt,
      maxTokens,
      preferredModel: model,
    });

    if (result.ok) {
      return result;
    }

    if (isLimitError(result.status, result.message)) {
      return result;
    }

    if (!isCapacityError(result.status, result.message)) {
      return result;
    }
  }

  return {
    ok: false,
    status: 503,
    message: "Gemini API is temporarily unavailable. Please try again later.",
  };
};

export const generateGeminiReply = async ({ systemPrompt, userPrompt }) => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw createServiceError("GOOGLE_GEMINI_API_KEY is not configured", 500);
  }

  if (typeof systemPrompt !== "string" || systemPrompt.trim().length === 0) {
    throw createServiceError("systemPrompt is required", 400);
  }

  if (typeof userPrompt !== "string" || userPrompt.trim().length === 0) {
    throw createServiceError("userPrompt is required", 400);
  }

  const preparedSystemPrompt = clampText(systemPrompt, PRIMARY_SYSTEM_PROMPT_CHARS);
  const preparedUserPrompt = clampText(userPrompt, PRIMARY_USER_PROMPT_CHARS);

  const primaryResult = await attemptGeminiAcrossModels({
    apiKey,
    systemPrompt: preparedSystemPrompt,
    userPrompt: preparedUserPrompt,
    maxTokens: PRIMARY_MAX_TOKENS,
    preferredModel: GEMINI_MODEL,
  });

  if (primaryResult.ok) {
    return {
      reply: primaryResult.reply,
      usage: primaryResult.usage,
      model: primaryResult.model,
    };
  }

  if (isLimitError(primaryResult.status, primaryResult.message)) {
    const retrySystemPrompt = clampText(systemPrompt, RETRY_SYSTEM_PROMPT_CHARS);
    const retryUserPrompt = buildCompactRetryUserPrompt(userPrompt);

    const retryResult = await attemptGeminiAcrossModels({
      apiKey,
      systemPrompt: retrySystemPrompt,
      userPrompt: retryUserPrompt,
      maxTokens: RETRY_MAX_TOKENS,
      preferredModel: GEMINI_MODEL,
    });

    if (retryResult.ok) {
      return {
        reply: retryResult.reply,
        usage: retryResult.usage,
        model: retryResult.model,
      };
    }

    if (isLimitError(retryResult.status, retryResult.message)) {
      throw createServiceError(GEMINI_LIMIT_FRIENDLY_MESSAGE, 429);
    }

    throw createServiceError(retryResult.message, toClientStatus(retryResult.status));
  }

  throw createServiceError(primaryResult.message, toClientStatus(primaryResult.status));
};

export default generateGeminiReply;
