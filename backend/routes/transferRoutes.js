import express from "express";
import {
  initiateTransfer,
  processTransfer,
  getTransferDetails,
  getMyTransfers,
  cancelTransfer,
  reverseTransfer,
  searchUsers,
  validateReceiver,
  getMyLimits,
  checkFeasibility,
} from "../controllers/transferController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// User discovery endpoints
router.get("/search-users", protect, searchUsers);
router.post("/validate-receiver", protect, validateReceiver);

// Transfer limit endpoints
router.get("/my-limits", protect, getMyLimits);
router.post("/check-feasibility", protect, checkFeasibility);

// Core transfer endpoints
router.post("/initiate", protect, initiateTransfer);
router.get("/my-transfers", protect, getMyTransfers);

// Specific transfer operations
router.get("/:transferId", protect, getTransferDetails);
router.post("/:transferId/process", protect, processTransfer);
router.post("/:transferId/cancel", protect, cancelTransfer);
router.post("/:transferId/reverse", protect, reverseTransfer);

export default router;
