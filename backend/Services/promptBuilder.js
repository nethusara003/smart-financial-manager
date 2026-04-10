const MAX_RECENT_ITEMS = 10;

const safeStringify = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
};

const buildIntentContext = (context, intent) => {
  const base = {
    user: {
      name: context?.user?.name || "User",
      email: context?.user?.email || "",
    },
    summary: context?.summary || {},
    monthlySummary: context?.monthlySummary || {},
    loans: {
      count: context?.loans?.count || 0,
      outstandingBalance: context?.loans?.outstandingBalance || 0,
    },
    budgets: {
      count: context?.budgets?.count || 0,
    },
    goals: {
      count: context?.goals?.count || 0,
    },
  };

  if (intent === "expenses") {
    return {
      ...base,
      expenses: {
        topSpendingCategories: context?.transactions?.topSpendingCategories || [],
        recentTransactions: (context?.transactions?.all || [])
          .filter((tx) => tx.type === "expense")
          .slice(0, MAX_RECENT_ITEMS),
      },
    };
  }

  if (intent === "loans") {
    return {
      ...base,
      loans: {
        ...base.loans,
        activeLoans: (context?.loans?.activeLoans || []).slice(0, MAX_RECENT_ITEMS),
        repaymentSchedules: context?.loans?.repaymentSchedules || {},
      },
    };
  }

  if (intent === "budgets") {
    return {
      ...base,
      budgets: {
        ...base.budgets,
        items: (context?.budgets?.items || []).slice(0, MAX_RECENT_ITEMS),
      },
    };
  }

  if (intent === "goals") {
    return {
      ...base,
      goals: {
        ...base.goals,
        items: (context?.goals?.items || []).slice(0, MAX_RECENT_ITEMS),
      },
    };
  }

  if (intent === "summary") {
    return {
      ...base,
      wallets: context?.wallets || {},
      transfers: {
        count: context?.transfers?.count || 0,
        recent: (context?.transfers?.history || []).slice(0, MAX_RECENT_ITEMS),
      },
      recentActivity: (context?.transactions?.recent || []).slice(0, MAX_RECENT_ITEMS),
    };
  }

  return {
    ...base,
    transactions: {
      count: context?.transactions?.count || 0,
      recent: (context?.transactions?.recent || []).slice(0, MAX_RECENT_ITEMS),
      topSpendingCategories: context?.transactions?.topSpendingCategories || [],
    },
    wallets: context?.wallets || {},
    transfers: {
      count: context?.transfers?.count || 0,
      recent: (context?.transfers?.history || []).slice(0, MAX_RECENT_ITEMS),
    },
    recurringTransactions: {
      count: context?.recurringTransactions?.count || 0,
      items: (context?.recurringTransactions?.items || []).slice(0, MAX_RECENT_ITEMS),
    },
    notifications: {
      count: context?.notifications?.count || 0,
      alerts: (context?.notifications?.alerts || []).slice(0, MAX_RECENT_ITEMS),
    },
    preferences: context?.preferences || {},
    system: context?.system || {},
  };
};

export const buildPrompt = (context, message, intent) => {
  const userName = context?.user?.name || "User";
  const intentContext = buildIntentContext(context, intent);

  const systemPrompt = `You are an intelligent financial assistant INSIDE the user's finance application.

You have FULL access to the system data including:
* Transactions
* Loans
* Budgets
* Goals
* Wallets
* Transfers

User:
* Name: ${userName}

Financial Summary:
* Income: ${context?.summary?.income || 0}
* Expenses: ${context?.summary?.expenses || 0}
* Savings: ${context?.summary?.savings || 0}

Loans:
* Active Loans: ${context?.loans?.count || 0}

BEHAVIOR RULES:
* Speak naturally and conversationally
* Do NOT overuse the user's name
* Use the name at most once or not at all
* Do NOT repeat the name in every sentence
* NEVER say "I don't have access"
* NEVER say "connect your accounts"
* NEVER say "I am a general assistant"
* ALWAYS act like part of the system
* NEVER hallucinate data
* ONLY use provided context
* If data is missing, say: "Based on your current records..."
* Provide helpful insights and suggestions
* Ask follow-up questions when appropriate
* Keep responses clean and professional

STYLE:
* Human-like
* Clear and concise
* Helpful and not robotic
* No unnecessary repetition

SAFETY:
If unsure, rely ONLY on context.
Do NOT invent numbers.`;

  const userPrompt = `${userName} asked:
${message}

Intent: ${intent}

Context data:
${safeStringify(intentContext)}

Respond naturally using the available system data.`;

  return {
    systemPrompt,
    userPrompt,
  };
};

export default buildPrompt;