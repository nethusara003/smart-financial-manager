import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const toObjectId = (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return new mongoose.Types.ObjectId(userId);
};

const round = (value) => Number((value || 0).toFixed(2));

const buildDateMatch = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return {};
  }

  const dateMatch = {};

  if (startDate) {
    dateMatch.$gte = startDate;
  }

  if (endDate) {
    dateMatch.$lt = endDate;
  }

  return { date: dateMatch };
};

const buildSummaryForRange = async ({ userId, startDate = null, endDate = null }) => {
  const objectId = toObjectId(userId);

  if (!objectId) {
    const error = Object.assign(new Error("Invalid userId"), { statusCode: 400 });
    throw error;
  }

  const baseMatch = {
    user: objectId,
    $or: [{ isTransfer: { $exists: false } }, { isTransfer: false }],
    ...buildDateMatch(startDate, endDate),
  };

  const [totalsResult, categoryResult] = await Promise.all([
    Transaction.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "expense",
          category: { $not: /^transfer$/i },
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          amount: { $round: ["$amount", 2] },
        },
      },
    ]),
  ]);

  const totals = totalsResult[0] || {};
  const income = round(totals.income || 0);
  const expenses = round(totals.expenses || 0);
  const savings = round(income - expenses);

  return {
    income,
    expenses,
    savings,
    categories: categoryResult,
    transactionCount: totals.transactionCount || 0,
    hasData: (totals.transactionCount || 0) > 0,
  };
};

export const getLastMonthSummary = async (userId) => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 30);

  return buildSummaryForRange({
    userId,
    startDate,
    endDate,
  });
};

export const getAllTimeSummary = async (userId) => {
  return buildSummaryForRange({ userId });
};

export const getCategoryBreakdown = async (userId) => {
  return buildSummaryForRange({ userId });
};

export default {
  getLastMonthSummary,
  getAllTimeSummary,
  getCategoryBreakdown,
};