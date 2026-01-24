import express from "express";
import { inviteAdmin } from "../controllers/adminController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.post("/invite", requireAuth, requireAdmin, inviteAdmin);

export default router;
