import mongoose from "mongoose";

const retirementPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: "Retirement Plan",
  },
  sourceInput: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  computedInput: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  projectedFund: {
    type: Number,
    required: true,
    default: 0,
  },
  probability: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 1,
  },
  scenarios: {
    type: [Number],
    default: [],
  },
  deterministic: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  predictions: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  simulation: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  advice: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  lastRefreshedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

retirementPlanSchema.index({ userId: 1, createdAt: -1 });

const RetirementPlan = mongoose.model("RetirementPlan", retirementPlanSchema);

export default RetirementPlan;
