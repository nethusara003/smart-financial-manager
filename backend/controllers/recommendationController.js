import { generateBudgetRecommendations } from "../Services/budgetRecommendationService.js";

/* =========================
   GET BUDGET RECOMMENDATIONS
========================= */
export const getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const recommendations = await generateBudgetRecommendations(userId);

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
