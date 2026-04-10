import express from "express";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Create + Get all
router.route("/")
  .post(requireAuth, addTransaction)
  .get(requireAuth, getTransactions);

// Update + Delete
router.route("/:id")
  .put(requireAuth, updateTransaction)
  .delete(requireAuth, deleteTransaction);

export default router;
