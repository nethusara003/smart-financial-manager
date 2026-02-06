import Transaction from "../models/Transaction.js";

/* =========================
   SIMPLE INTENT DETECTION
========================= */
const detectIntent = (message) => {
  const text = message.toLowerCase();

  if (text.includes("most") && text.includes("spend")) {
    return "TOP_EXPENSE_CATEGORY";
  }

  if (text.includes("summary") || text.includes("month")) {
    return "MONTHLY_SUMMARY";
  }

  if (text.includes("save")) {
    return "SAVING_ADVICE";
  }

  if (text.includes("balance")) {
    return "BALANCE_ANALYSIS";
  }

  return "UNKNOWN";
};

/* =========================
   MAIN CONTROLLER
========================= */
export const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    const intent = detectIntent(message);

    /* =========================
       INTENT HANDLERS
    ========================= */

    // 1️⃣ TOP EXPENSE CATEGORY
    if (intent === "TOP_EXPENSE_CATEGORY") {
      const result = await Transaction.aggregate([
        { $match: { user: req.user._id, type: "expense" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]);

      if (result.length === 0) {
        return res.json({
          reply: "You don't have enough expense data yet.",
        });
      }

      return res.json({
        reply: `You spent the most on ${result[0]._id} (Rs. ${result[0].total.toLocaleString()}). Consider setting a budget for this category.`,
      });
    }

    // 2️⃣ MONTHLY SUMMARY
    if (intent === "MONTHLY_SUMMARY") {
      const data = await Transaction.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const income =
        data.find((d) => d._id === "income")?.total || 0;
      const expense =
        data.find((d) => d._id === "expense")?.total || 0;

      return res.json({
        reply: `This month, your total income is Rs. ${income.toLocaleString()} and total expenses are Rs. ${expense.toLocaleString()}.`,
      });
    }

    // 3️⃣ BALANCE ANALYSIS
    if (intent === "BALANCE_ANALYSIS") {
      const data = await Transaction.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const income =
        data.find((d) => d._id === "income")?.total || 0;
      const expense =
        data.find((d) => d._id === "expense")?.total || 0;

      const balance = income - expense;

      return res.json({
        reply:
          balance >= 0
            ? `Your balance is positive (Rs. ${balance.toLocaleString()}). Good financial control so far.`
            : `Your expenses exceed your income by Rs. ${Math.abs(balance).toLocaleString()}. Consider reducing non-essential expenses.`,
      });
    }

    // 4️⃣ SAVING ADVICE
    if (intent === "SAVING_ADVICE") {
      return res.json({
        reply:
          "A good rule is the 50/30/20 method: 50% needs, 30% wants, 20% savings. Try tracking subscriptions and food expenses to start saving.",
      });
    }

    // ❓ UNKNOWN
    return res.json({
      reply:
        "I can help analyze your spending, balance, or savings. Try asking about your expenses or monthly summary.",
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      reply: "Something went wrong while analyzing your data.",
    });
  }
};
