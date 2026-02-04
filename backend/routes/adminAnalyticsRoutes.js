import express from "express";
import {
  getAdminAnalyticsOverview,
} from "../controllers/adminAnalyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/overview",
  authMiddleware,
  adminMiddleware,
  getAdminAnalyticsOverview
);

export default router;
