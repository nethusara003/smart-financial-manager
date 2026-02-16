import express from "express";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetWithSpending
} from "../controllers/budgetController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, getBudgets);
router.get("/with-spending", requireAuth, getBudgetWithSpending);
router.post("/", requireAuth, createBudget);
router.put("/:id", requireAuth, updateBudget);
router.delete("/:id", requireAuth, deleteBudget);

export default router;
