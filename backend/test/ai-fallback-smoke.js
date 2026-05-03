const ENDPOINT = process.env.AI_SMOKE_ENDPOINT || "http://localhost:5000/api/ai/chat";
const TOKEN = process.env.AI_SMOKE_TOKEN || "";
const MAX_FALLBACK_RATE = Number(process.env.AI_SMOKE_MAX_FALLBACK_RATE || 0.35);

const QUESTIONS = [
  "How much did I spend this month?",
  "What is my top spending category this month?",
  "Am I over budget in any category?",
  "Summarize my income and expenses this month.",
  "How many active loans do I have?",
  "What should I focus on to improve savings?",
  "Give me a short financial health summary.",
  "Which goal is closest to completion?",
];

const isFallbackReply = (payload) => {
  const model = String(payload?.model || "").toLowerCase();
  if (model === "limit-fallback" || model === "limit-cooldown") {
    return true;
  }

  const reply = String(payload?.reply || payload?.message || "").toLowerCase();
  return reply.includes("exceeded the ai model limits");
};

const run = async () => {
  if (!TOKEN) {
    console.error("AI_SMOKE_TOKEN is required.");
    process.exit(2);
  }

  if (!Number.isFinite(MAX_FALLBACK_RATE) || MAX_FALLBACK_RATE < 0 || MAX_FALLBACK_RATE > 1) {
    console.error("AI_SMOKE_MAX_FALLBACK_RATE must be a number between 0 and 1.");
    process.exit(2);
  }

  let fallbackCount = 0;
  let errorCount = 0;

  console.log(`Running AI fallback smoke on ${ENDPOINT}`);
  console.log(`Threshold: max fallback rate ${Math.round(MAX_FALLBACK_RATE * 100)}%`);

  for (let index = 0; index < QUESTIONS.length; index += 1) {
    const message = QUESTIONS[index];
    const sessionId = `smoke-ai-${Date.now()}-${index}`;

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ message, sessionId }),
      });

      const payload = await response.json().catch(() => ({}));
      const fallback = isFallbackReply(payload);

      if (!response.ok) {
        errorCount += 1;
      }

      if (fallback) {
        fallbackCount += 1;
      }

      const model = String(payload?.model || "unknown");
      console.log(
        `[${index + 1}/${QUESTIONS.length}] status=${response.status} model=${model} fallback=${fallback ? "yes" : "no"}`
      );
    } catch (error) {
      errorCount += 1;
      fallbackCount += 1;
      console.log(`[${index + 1}/${QUESTIONS.length}] request failed: ${error.message}`);
    }
  }

  const fallbackRate = fallbackCount / QUESTIONS.length;
  console.log("\nAI fallback smoke summary");
  console.log(`Fallbacks: ${fallbackCount}/${QUESTIONS.length}`);
  console.log(`Fallback rate: ${(fallbackRate * 100).toFixed(1)}%`);
  console.log(`Errors: ${errorCount}/${QUESTIONS.length}`);

  if (fallbackRate > MAX_FALLBACK_RATE) {
    console.error(
      `Fallback rate ${fallbackRate.toFixed(3)} exceeded threshold ${MAX_FALLBACK_RATE.toFixed(3)}.`
    );
    process.exit(1);
  }

  console.log("Fallback rate is within threshold.");
};

run();
