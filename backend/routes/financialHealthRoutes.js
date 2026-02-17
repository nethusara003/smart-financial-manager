import express from "express";
import {
  getFinancialHealthScore,
  getHealthHistory,
} from "../controllers/financialHealthController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// @route   GET /api/financial-health/score
// @desc    Get current financial health score
// @access  Private
router.get("/score", requireAuth, getFinancialHealthScore);

// @route   GET /api/financial-health/history
// @desc    Get financial health score history
// @access  Private
router.get("/history", requireAuth, getHealthHistory);

export default router;
