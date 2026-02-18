import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    loanName: {
      type: String,
      required: [true, "Loan name is required"],
      trim: true,
    },
    loanType: {
      type: String,
      enum: ["home", "car", "personal", "education", "business", "other"],
      required: [true, "Loan type is required"],
    },
    principalAmount: {
      type: Number,
      required: [true, "Principal amount is required"],
      min: [0, "Principal amount cannot be negative"],
    },
    interestRate: {
      type: Number,
      required: [true, "Interest rate is required"],
      min: [0, "Interest rate cannot be negative"],
      max: [100, "Interest rate cannot exceed 100%"],
    },
    tenure: {
      type: Number,
      required: [true, "Tenure is required"],
      min: [1, "Tenure must be at least 1 month"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    emiAmount: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalPayment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "paid", "closed", "defaulted"],
      default: "active",
      index: true,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    lender: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    nextPaymentDate: {
      type: Date,
    },
    paymentDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    prepaymentPenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    insuranceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    processingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field: Total amount paid so far
loanSchema.virtual("paidAmount").get(function () {
  return this.principalAmount - this.remainingBalance;
});

// Virtual field: Remaining tenure in months
loanSchema.virtual("remainingTenure").get(function () {
  if (!this.nextPaymentDate || !this.endDate) return 0;
  
  const today = new Date();
  const end = new Date(this.endDate);
  const months = (end.getFullYear() - today.getFullYear()) * 12 + 
                 (end.getMonth() - today.getMonth());
  
  return Math.max(0, months);
});

// Virtual field: Completion percentage
loanSchema.virtual("completionPercentage").get(function () {
  if (this.principalAmount === 0) return 0;
  
  const paid = this.principalAmount - this.remainingBalance;
  return Math.min(100, Math.round((paid / this.principalAmount) * 100));
});

// Pre-save middleware to calculate end date
loanSchema.pre("save", function () {
  if (this.isNew || this.isModified("startDate") || this.isModified("tenure")) {
    const startDate = new Date(this.startDate);
    this.endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + this.tenure,
      startDate.getDate()
    );
  }
  
  // Initialize remaining balance if new loan
  if (this.isNew) {
    this.remainingBalance = this.principalAmount;
  }
});

// Indexes for better query performance
loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ userId: 1, nextPaymentDate: 1 });

// Ensure virtuals are included when converting to JSON
loanSchema.set("toJSON", { virtuals: true });
loanSchema.set("toObject", { virtuals: true });

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
