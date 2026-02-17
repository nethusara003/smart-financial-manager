import express from "express";
import {
  getExpenseForecast,
  getForecastByCategory,
} from "../controllers/forecastingController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// @route   GET /api/forecasting/expenses
// @desc    Get expense forecast for upcoming months
// @access  Private
router.get("/expenses", requireAuth, getExpenseForecast);

// @route   GET /api/forecasting/category/:category
// @desc    Get forecast for specific category
// @access  Private
router.get("/category/:category", requireAuth, getForecastByCategory);

export default router;
