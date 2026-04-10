import express from "express";
import {
  getWalletBalance,
  addFundsToWallet,
  withdrawFromWallet,
  getWalletTransactions,
  createOrInitializeWallet,
} from "../controllers/walletController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Wallet management routes
router.get("/balance", requireAuth, getWalletBalance);
router.post("/initialize", requireAuth, createOrInitializeWallet);
router.post("/add-funds", requireAuth, addFundsToWallet);
router.post("/withdraw", requireAuth, withdrawFromWallet);
router.get("/transactions", requireAuth, getWalletTransactions);

export default router;
