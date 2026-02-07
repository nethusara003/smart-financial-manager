import express from "express";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
} from "../controllers/goalController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// @route   GET /api/goals
// @desc    Get all goals for the authenticated user
// @access  Private
router.get("/", getGoals);

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post("/", createGoal);

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put("/:id", updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete("/:id", deleteGoal);

// @route   PUT /api/goals/:id/contribute
// @desc    Add contribution to a goal
// @access  Private
router.put("/:id/contribute", addContribution);

export default router;