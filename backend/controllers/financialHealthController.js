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
    const months = parseInt(req.query.months) || 1; // Default to 1 month minimum

    console.log(`[Controller] Fetching health score for user ${userId}, months: ${months}`);
    const healthScore = await calculateFinancialHealthScore(userId, months);
    
    console.log('[Controller] Health score result:', JSON.stringify(healthScore, null, 2));
    
    // If success is false, return 400 status so frontend catches it properly
    if (healthScore.success === false) {
      return res.status(400).json(healthScore);
    }

    res.json(healthScore);
  } catch (error) {
    console.error("❌ [Controller] Error fetching financial health score:", error);
    console.error("❌ [Controller] Error stack:", error.stack);
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
