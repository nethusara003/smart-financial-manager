const MAX_HISTORY_MESSAGES = 5;

const normalizeName = (value) => {
  if (typeof value !== "string") {
    return "User";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "User";
};

const formatHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return "No recent conversation history.";
  }

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => {
      const role = entry.role === "assistant" ? "Assistant" : "User";
      return `${role}: ${entry.content}`;
    })
    .join("\n");
};

export const buildFinancialPrompt = ({ userData, userProfile, message, history = [] }) => {
  const safeData = userData || {};
  const safeProfile = userProfile || {};
  const safeName = normalizeName(safeProfile.name);
  const safeEmail =
    typeof safeProfile.email === "string" && safeProfile.email.trim().length > 0
      ? safeProfile.email.trim()
      : "Not provided";

  const systemPrompt = `You are a personal financial assistant inside a finance app.

You KNOW the user you are talking to.

User Information:

* Name: ${safeName}
* Email: ${safeEmail}

Financial Data:

* Income: ${safeData.income}
* Expenses: ${safeData.expenses}
* Savings: ${safeData.savings}

STRICT RULES:

* Always use the user's name when appropriate
* NEVER say you don't know the user's name
* NEVER suggest connecting accounts
* NEVER invent financial values
* ONLY use provided data
* If data missing -> say "No financial data available"

You are a PERSONAL assistant, not a generic chatbot.`;

  const userPrompt = `Here is the user's REAL financial data:

Income: ${safeData.income}
Expenses: ${safeData.expenses}
Savings: ${safeData.savings}
Categories: ${JSON.stringify(safeData.categories || [])}

Recent history:
${formatHistory(history)}

User (${safeName}) asked:

${message}

Respond naturally as a personal assistant.
Answer using ONLY this data.`;

  return {
    systemPrompt,
    userPrompt,
  };
};

export const buildGeneralPrompt = ({ message, userProfile, history = [] }) => {
  const safeName = normalizeName(userProfile?.name);

  const userPrompt = `Recent history:
${formatHistory(history)}

User (${safeName}) asked:
${message}

Respond naturally as a personal assistant.`;

  return {
    systemPrompt: `You are a personal financial assistant.
Always address the user as ${safeName} when helpful.
Never claim that you do not know the user's name.
Never invent personal financial numbers.
Never suggest connecting accounts.`,
    userPrompt,
  };
};

export default buildFinancialPrompt;
