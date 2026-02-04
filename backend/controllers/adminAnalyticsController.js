import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getAdminAnalyticsOverview = async (req, res) => {
  try {
    /* =========================
       BASIC COUNTS
    ========================= */
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    /* =========================
       TOTAL SYSTEM VOLUME
       (Income + Expense)
    ========================= */
    const volumeResult = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
        },
      },
    ]);

    const totalVolume = volumeResult[0]?.totalVolume || 0;

    /* =========================
       ACTIVE USERS (LAST 30 DAYS)
    ========================= */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await Transaction.distinct("user", {
      createdAt: { $gte: thirtyDaysAgo },
    });

    /* =========================
       HIGH-RISK USERS
       (Expense > Income in last 30 days)
    ========================= */
    const riskyUsers = await Transaction.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            user: "$user",
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.user",
          totals: {
            $push: {
              type: "$_id.type",
              amount: "$total",
            },
          },
        },
      },
      {
        $project: {
          income: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$totals",
                    as: "t",
                    cond: { $eq: ["$$t.type", "income"] },
                  },
                },
                as: "i",
                in: "$$i.amount",
              },
            },
          },
          expense: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$totals",
                    as: "t",
                    cond: { $eq: ["$$t.type", "expense"] },
                  },
                },
                as: "e",
                in: "$$e.amount",
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: { $gt: ["$expense", "$income"] },
        },
      },
    ]);

    /* =========================
       RESPONSE
    ========================= */
    res.json({
      users: {
        total: totalUsers,
        activeLast30Days: activeUsers.length,
        highRisk: riskyUsers.length,
      },
      transactions: {
        total: totalTransactions,
        totalVolume,
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: "Failed to load admin analytics" });
  }
};
