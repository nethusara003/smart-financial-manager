import express from "express";
import {
  getWalletBalance,
  addFundsToWallet,
  withdrawFromWallet,
  getWalletTransactions,
  createOrInitializeWallet,
} from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Wallet management routes
router.get("/balance", protect, getWalletBalance);
router.post("/initialize", protect, createOrInitializeWallet);
router.post("/add-funds", protect, addFundsToWallet);
router.post("/withdraw", protect, withdrawFromWallet);
router.get("/transactions", protect, getWalletTransactions);

export default router;
