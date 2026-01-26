import Transaction from "../models/Transaction.js";
import User from "../models/user.js";

/* =========================
   USER TRANSACTIONS
========================= */
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Admin get user transactions error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

/* =========================
   ALL TRANSACTIONS
========================= */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Admin get all transactions error:", error);
    res.status(500).json({ message: "Failed to fetch all transactions" });
  }
};

/* =========================
   ADMIN ANALYTICS (STEP 3)
========================= */
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalIncomeAgg = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenseAgg = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = totalIncomeAgg[0]?.total || 0;
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    const topCategories = await Transaction.aggregate([
      { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
    ]);

    const topSpenders = await Transaction.aggregate([
      { $match: { type: "expense" } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$amount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
        },
      },
    ]);

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      topCategories,
      topSpenders,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
