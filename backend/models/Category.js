import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["ESSENTIAL", "NON_ESSENTIAL"],
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
