import express from "express";
import { getBudgetRecommendations } from "../controllers/recommendationController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// @route   GET /api/recommendations/budget
// @desc    Get AI-powered budget recommendations
// @access  Private
router.get("/budget", requireAuth, getBudgetRecommendations);

export default router;
