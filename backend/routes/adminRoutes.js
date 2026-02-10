import express from "express";
import {
  inviteAdmin,
  getAllUsers,
  promoteToAdmin,
  demoteToUser,
  getRecentAuditLogs,
} from "../controllers/adminController.js";

import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { acceptAdminInvite } from "../controllers/adminAcceptController.js";

import {
  getUserTransactions,
  getAllTransactions,
  getAdminAnalytics, // ✅ ADDED
} from "../controllers/adminTransactionController.js";

const router = express.Router();

/* =========================
   ADMIN MANAGEMENT
========================= */
router.post("/invite", requireAuth, requireAdmin, inviteAdmin);
router.post("/accept-invite", acceptAdminInvite);

router.get("/users", requireAuth, requireAdmin, getAllUsers);

router.patch(
  "/promote/:userId",
  requireAuth,
  requireAdmin,
  promoteToAdmin
);

router.patch(
  "/demote/:userId",
  requireAuth,
  requireAdmin,
  demoteToUser
);

/* =========================
   TRANSACTIONS
========================= */
router.get(
  "/users/:userId/transactions",
  requireAuth,
  requireAdmin,
  getUserTransactions
);

router.get(
  "/transactions",
  requireAuth,
  requireAdmin,
  getAllTransactions
);

/* =========================
   ANALYTICS (STEP 3)
========================= */
router.get(
  "/analytics/overview",
  requireAuth,
  requireAdmin,
  getAdminAnalytics
);

/* =========================
   AUDIT LOGS
========================= */
router.get(
  "/audit-logs",
  requireAuth,
  requireAdmin,
  getRecentAuditLogs
);

export default router;
