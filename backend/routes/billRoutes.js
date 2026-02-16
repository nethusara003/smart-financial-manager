import express from "express";
import {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getUpcomingBills
} from "../controllers/billController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, getBills);
router.get("/upcoming", requireAuth, getUpcomingBills);
router.post("/", requireAuth, createBill);
router.put("/:id", requireAuth, updateBill);
router.delete("/:id", requireAuth, deleteBill);
router.patch("/:id/mark-paid", requireAuth, markBillAsPaid);

export default router;
