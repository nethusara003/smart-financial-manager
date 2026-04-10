import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

import {
  getAdminAnalyticsOverview,
} from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get(
  "/overview",
  requireAuth,
  requireAdmin,
  getAdminAnalyticsOverview
);


export default router;
