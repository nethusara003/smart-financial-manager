import express from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  calculateRetirementProjection,
  simulateRetirementProjection,
  adviseRetirementProjection,
  listSavedRetirementPlans,
  saveRetirementProjection,
  refreshSavedRetirementProjection,
} from "./retirement.controller.js";

const router = express.Router();

router.use(requireAuth);

router.post("/calculate", calculateRetirementProjection);
router.post("/simulate", simulateRetirementProjection);
router.post("/advise", adviseRetirementProjection);
router.get("/plans", listSavedRetirementPlans);
router.post("/plans", saveRetirementProjection);
router.post("/plans/:planId/refresh", refreshSavedRetirementProjection);

export default router;
