import { generateBudgetRecommendations } from "../Services/budgetRecommendationService.js";

/* =========================
   GET BUDGET RECOMMENDATIONS
========================= */
export const getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const months = parseInt(req.query.months) || 1; // Default to 1 month minimum

    const recommendations = await generateBudgetRecommendations(userId, months);

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching budget recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate budget recommendations",
      error: error.message,
    });
  }
};
