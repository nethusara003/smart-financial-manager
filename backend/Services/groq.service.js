const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_REQUEST_TIMEOUT_MS = 20000;

const createServiceError = (message, statusCode = 500) => {
  return Object.assign(new Error(message), { statusCode });
};

export const generateGroqReply = async ({ systemPrompt, userPrompt }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw createServiceError("GROQ_API_KEY is not configured", 500);
  }

  if (typeof systemPrompt !== "string" || systemPrompt.trim().length === 0) {
    throw createServiceError("systemPrompt is required", 400);
  }

  if (typeof userPrompt !== "string" || userPrompt.trim().length === 0) {
    throw createServiceError("userPrompt is required", 400);
  }

  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, GROQ_REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
        presence_penalty: 0.3,
      }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createServiceError("Groq API request timed out", 504);
    }

    throw createServiceError("Failed to reach Groq API", 502);
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw createServiceError("Invalid response received from Groq API", 502);
  }

  if (!response.ok) {
    const upstreamMessage = payload?.error?.message || "Groq API request failed";
    throw createServiceError(upstreamMessage, response.status >= 500 ? 502 : response.status);
  }

  const aiText = payload?.choices?.[0]?.message?.content;

  if (typeof aiText !== "string" || aiText.trim().length === 0) {
    throw createServiceError("Groq API returned an empty response", 502);
  }

  return aiText.trim();
};

export default generateGroqReply;