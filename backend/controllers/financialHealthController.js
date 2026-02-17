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

    const healthScore = await calculateFinancialHealthScore(userId);

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
