import Goal from "../models/Goal.js";

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
      category,
      priority,
      color,
      icon,
    } = req.body;

    const goal = new Goal({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      category,
      priority: priority || "medium",
      color: color || "primary",
      icon: icon || "PiggyBank",
      status: "active",
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: "Failed to create goal", error: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if goal belongs to the user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this goal" });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: "Failed to update goal", error: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if goal belongs to the user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this goal" });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete goal", error: error.message });
  }
};

// @desc    Add contribution to a goal
// @route   PUT /api/goals/:id/contribute
// @access  Private
export const addContribution = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid contribution amount" });
    }

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if goal belongs to the user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this goal" });
    }

    // Update current amount and status
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    
    // Mark as completed if target is reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed";
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: "Failed to add contribution", error: error.message });
  }
};