import express from "express";
console.log("✅ userRoutes loaded");

import {
  registerUser,
  loginUser,
  guestLogin,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateCurrency,
  changePassword,
  updateProfile,
  updateNotificationSettings,
  updatePrivacySettings,
  exportUserData,
  deleteAccount,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/guest-login", guestLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", requireAuth, getUserProfile);
router.post("/update-currency", requireAuth, updateCurrency);
router.post("/change-password", requireAuth, changePassword);
router.put("/profile", requireAuth, updateProfile);
router.put("/notification-settings", requireAuth, updateNotificationSettings);
router.put("/privacy-settings", requireAuth, updatePrivacySettings);
router.get("/export-data", requireAuth, exportUserData);
router.post("/delete-account", requireAuth, deleteAccount);

export default router;

import User from "../models/User.js";

router.get("/__debug/users", async (req, res) => {
  const users = await User.find({}, { email: 1 });
  res.json(users);
});

