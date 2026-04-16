// @ts-nocheck
// @ts-ignore - Runtime module resolution is valid; JS check can misresolve this path on Windows casing.
import {
  calculateFinancialHealthScore,
  getFinancialHealthHistory,
} from "../Services/financialHealthService.js";

/* =========================
   GET FINANCIAL HEALTH SCORE
========================= */
export const getFinancialHealthScore = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const monthsParam = Number.parseInt(req.query.months, 10);
    const months = Number.isFinite(monthsParam) ? Math.min(24, Math.max(1, monthsParam)) : 1;

    const healthScore = await calculateFinancialHealthScore(userId, months);

    // If success is false, return 400 status so frontend catches it properly
    if (healthScore.success === false) {
      return res.status(400).json(healthScore);
    }

    res.json(healthScore);
  } catch (error) {
    console.error("Error fetching financial health score:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate financial health score",
      error: error.message,
    });
  }
};

/* =========================
   GET FINANCIAL HEALTH HISTORY
========================= */
export const getHealthHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const months = parseInt(req.query.months) || 6;

    const history = await getFinancialHealthHistory(userId, months);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error fetching financial health history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial health history",
      error: error.message,
    });
  }
};
