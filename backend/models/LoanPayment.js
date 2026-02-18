import mongoose from "mongoose";

const loanPaymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: [true, "Loan ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
      index: true,
    },
    paymentAmount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },
    principalPaid: {
      type: Number,
      required: [true, "Principal paid is required"],
      min: [0, "Principal paid cannot be negative"],
    },
    interestPaid: {
      type: Number,
      required: [true, "Interest paid is required"],
      min: [0, "Interest paid cannot be negative"],
    },
    remainingBalance: {
      type: Number,
      required: [true, "Remaining balance is required"],
      min: [0, "Remaining balance cannot be negative"],
    },
    paymentNumber: {
      type: Number,
      required: [true, "Payment number is required"],
      min: [1, "Payment number must be at least 1"],
    },
    paymentType: {
      type: String,
      enum: ["regular", "extra", "prepayment", "final"],
      default: "regular",
    },
    paymentMethod: {
      type: String,
      enum: ["auto-debit", "manual", "online"],
      default: "manual",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    notes: {
      type: String,
      trim: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, "Late fee cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
loanPaymentSchema.index({ loanId: 1, paymentDate: -1 });
loanPaymentSchema.index({ userId: 1, paymentDate: -1 });

// Pre-save validation
loanPaymentSchema.pre("save", function () {
  // Validate that principalPaid + interestPaid equals paymentAmount
  const total = this.principalPaid + this.interestPaid + this.lateFee;
  const difference = Math.abs(total - this.paymentAmount);
  
  if (difference > 0.01) { // Allow for rounding errors
    throw new Error(
      `Payment amount mismatch: Principal (${this.principalPaid}) + Interest (${this.interestPaid}) + Late Fee (${this.lateFee}) should equal Payment Amount (${this.paymentAmount})`
    );
  }
});

const LoanPayment = mongoose.model("LoanPayment", loanPaymentSchema);

export default LoanPayment;
