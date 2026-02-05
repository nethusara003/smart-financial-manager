import express from "express";
console.log("✅ userRoutes loaded");

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

import User from "../models/User.js";

router.get("/__debug/users", async (req, res) => {
  const users = await User.find({}, { email: 1 });
  res.json(users);
});

