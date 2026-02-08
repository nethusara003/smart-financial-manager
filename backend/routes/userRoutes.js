import express from "express";
console.log("✅ userRoutes loaded");

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateCurrency,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-currency", requireAuth, updateCurrency);

export default router;

import User from "../models/User.js";

router.get("/__debug/users", async (req, res) => {
  const users = await User.find({}, { email: 1 });
  res.json(users);
});

