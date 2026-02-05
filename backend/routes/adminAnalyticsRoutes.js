import express from "express";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  getAdminAnalyticsOverview,
} from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get(
  "/overview",
  protect,
  adminMiddleware,
  getAdminAnalyticsOverview
);


export default router;
