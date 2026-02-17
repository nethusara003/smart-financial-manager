import express from "express";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetWithSpending
} from "../controllers/budgetController.js";
import { generateSmartBudget, analyzeAllCategories, generateBudgetsFromIncome } from "../controllers/smartBudgetController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, getBudgets);
router.get("/with-spending", requireAuth, getBudgetWithSpending);
router.get("/smart-analyze", requireAuth, analyzeAllCategories);
router.post("/", requireAuth, createBudget);
router.post("/smart-generate", requireAuth, generateSmartBudget);
router.post("/generate-from-income", requireAuth, generateBudgetsFromIncome);
router.put("/:id", requireAuth, updateBudget);
router.delete("/:id", requireAuth, deleteBudget);

export default router;
