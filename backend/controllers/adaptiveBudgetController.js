import User from "../models/User.js";
import {
  AdaptiveBudgetValidationError,
  computeAdaptiveBudgetStatus,
  getAdaptiveBudgetAnalysis,
} from "../Services/adaptiveBudget.service.js";

const USER_SELECT_FIELDS = "monthlySalary savingsPercentage currency";

function resolveErrorStatus(error) {
  if (error instanceof AdaptiveBudgetValidationError) {
    return error.statusCode;
  }

  return error.statusCode || 500;
}

export const getAdaptiveStatus = async (req, res) => {
  try {
    if (!req.user || req.user.isGuest) {
      return res.status(403).json({
        message: "Adaptive budgeting is available for registered users only.",
      });
    }

    const user = await User.findById(req.user._id).select(USER_SELECT_FIELDS).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const payload = await computeAdaptiveBudgetStatus(user);
    return res.json(payload);
  } catch (error) {
    const statusCode = resolveErrorStatus(error);

    if (statusCode >= 500) {
      console.error("Error getting adaptive budget status:", error);
    }

    return res.status(statusCode).json({
      message: error.message || "Failed to calculate budget status",
    });
  }
};

export const getAdaptiveAnalysis = async (req, res) => {
  try {
    if (!req.user || req.user.isGuest) {
      return res.status(403).json({
        message: "Adaptive budgeting is available for registered users only.",
      });
    }

    const user = await User.findById(req.user._id).select(USER_SELECT_FIELDS).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const payload = await getAdaptiveBudgetAnalysis(user);
    return res.json(payload);
  } catch (error) {
    const statusCode = resolveErrorStatus(error);

    if (statusCode >= 500) {
      console.error("Error getting adaptive budget analysis:", error);
    }

    return res.status(statusCode).json({
      message: error.message || "Failed to analyze budget",
    });
  }
};
