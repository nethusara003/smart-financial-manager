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
  sendTransferOtp,
  getSavedRecipients,
} from "../controllers/transferController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// User discovery endpoints
router.get("/search-users", requireAuth, searchUsers);
router.get("/contacts", requireAuth, getSavedRecipients);
router.post("/validate-receiver", requireAuth, validateReceiver);
router.post("/send-otp", requireAuth, sendTransferOtp);

// Transfer limit endpoints
router.get("/my-limits", requireAuth, getMyLimits);
router.post("/check-feasibility", requireAuth, checkFeasibility);

// Core transfer endpoints
router.post("/initiate", requireAuth, initiateTransfer);
router.get("/my-transfers", requireAuth, getMyTransfers);

// Specific transfer operations
router.get("/:transferId", requireAuth, getTransferDetails);
router.post("/:transferId/process", requireAuth, processTransfer);
router.post("/:transferId/cancel", requireAuth, cancelTransfer);
router.post("/:transferId/reverse", requireAuth, reverseTransfer);

export default router;
