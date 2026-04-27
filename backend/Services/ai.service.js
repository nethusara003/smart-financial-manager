import { generateGroqReply } from "./groq.service.js";

const ADVICE_FALLBACK_MODEL = "rules-based-fallback";

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPercent = (value) => {
  const safe = Math.max(0, Math.min(1, toSafeNumber(value, 0)));
  return Number((safe * 100).toFixed(2));
};

const buildRiskLevel = (probabilityOfSuccess) => {
  const probabilityPercent = toPercent(probabilityOfSuccess);

  if (probabilityPercent >= 75) {
    return "Low";
  }

  if (probabilityPercent >= 50) {
    return "Moderate";
  }

  return "High";
};

const buildFallbackAdvice = (data) => {
  const projectedFund = toSafeNumber(data.projectedRetirementFund, 0);
  const probabilityOfSuccess = toPercent(data.probabilityOfSuccess);
  const targetAmount = toSafeNumber(data.targetAmount, 0);
  const shortfall = Math.max(0, targetAmount - projectedFund);

  return {
    explanation:
      shortfall > 0
        ? `Current projection is ${projectedFund.toFixed(2)} versus target ${targetAmount.toFixed(
            2
          )}, with success probability ${probabilityOfSuccess.toFixed(2)}%. The current plan has a shortfall of ${shortfall.toFixed(
            2
          )}.`
        : `Current projection is ${projectedFund.toFixed(2)} versus target ${targetAmount.toFixed(
            2
          )}, with success probability ${probabilityOfSuccess.toFixed(2)}%. The plan is currently above target.`,
    riskLevel: buildRiskLevel(data.probabilityOfSuccess),
    strategies: [
      "Increase monthly savings by 5% to 10% and re-run simulation quarterly.",
      "Review discretionary expenses and redirect at least one category saving into investments.",
      "Stress-test annually with lower returns and higher inflation to keep the plan resilient.",
    ],
    source: ADVICE_FALLBACK_MODEL,
    model: ADVICE_FALLBACK_MODEL,
  };
};

const parseAdviceJson = (replyText) => {
  if (typeof replyText !== "string") {
    return null;
  }

  const trimmed = replyText.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }

    return null;
  }
};

export async function generateAdvice(data) {
  const normalizedData = {
    projectedRetirementFund: toSafeNumber(data?.projectedRetirementFund, 0),
    probabilityOfSuccess: Math.max(0, Math.min(1, toSafeNumber(data?.probabilityOfSuccess, 0))),
    targetAmount: toSafeNumber(data?.targetAmount, 0),
    simulationResults: {
      mean: toSafeNumber(data?.simulationResults?.mean, 0),
      median: toSafeNumber(data?.simulationResults?.median, 0),
      percentile10: toSafeNumber(data?.simulationResults?.percentile10, 0),
      percentile90: toSafeNumber(data?.simulationResults?.percentile90, 0),
    },
  };

  const systemPrompt = [
    "You are a professional financial advisor.",
    "Use only the provided numbers.",
    "Do not hallucinate numbers or assumptions not present in the payload.",
    "Return valid JSON only with keys: explanation, riskLevel, strategies.",
    "riskLevel must be one of: Low, Moderate, High.",
    "strategies must be an array of exactly 3 concise actionable strings.",
  ].join("\n");

  const userPrompt = [
    "Given data:",
    JSON.stringify(
      {
        projectedRetirementFund: normalizedData.projectedRetirementFund,
        probabilityOfSuccessPercent: toPercent(normalizedData.probabilityOfSuccess),
        targetAmount: normalizedData.targetAmount,
        simulationResults: normalizedData.simulationResults,
      },
      null,
      2
    ),
    "Provide:",
    "1. Clear explanation",
    "2. Risk level",
    "3. Three actionable strategies",
  ].join("\n");

  try {
    const aiResult = await generateGroqReply({
      systemPrompt,
      userPrompt,
    });

    const parsed = parseAdviceJson(aiResult.reply);

    if (parsed && typeof parsed === "object") {
      const strategies = Array.isArray(parsed.strategies)
        ? parsed.strategies.map((entry) => String(entry || "").trim()).filter(Boolean).slice(0, 3)
        : [];

      return {
        explanation: String(parsed.explanation || "").trim() || buildFallbackAdvice(normalizedData).explanation,
        riskLevel: ["Low", "Moderate", "High"].includes(parsed.riskLevel)
          ? parsed.riskLevel
          : buildRiskLevel(normalizedData.probabilityOfSuccess),
        strategies:
          strategies.length === 3 ? strategies : buildFallbackAdvice(normalizedData).strategies,
        source: "llm",
        model: aiResult.model,
      };
    }

    return {
      ...buildFallbackAdvice(normalizedData),
      explanation: aiResult.reply,
      source: "llm-text-fallback",
      model: aiResult.model,
    };
  } catch {
    return buildFallbackAdvice(normalizedData);
  }
}

export default generateAdvice;
