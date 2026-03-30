import mongoose from "mongoose";

const scheduleItemSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    emiAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    actualPaymentDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const amortizationScheduleSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: [true, "Loan ID is required"],
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    schedule: {
      type: [scheduleItemSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    totalEMI: {
      type: Number,
      default: 0,
    },
    totalPrincipal: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    hasModifications: {
      type: Boolean,
      default: false,
      comment: "Set to true if prepayments or modifications were made",
    },
  },
  {
    timestamps: true,
  }
);

// Method to mark a payment as paid
/** @this {any} */
amortizationScheduleSchema.methods.markPaymentPaid = function (
  paymentNumber,
  actualDate
) {
  const document = /** @type {any} */ (this);
  const payment = document.schedule.find(
    (item) => item.paymentNumber === paymentNumber
  );
  
  if (payment) {
    payment.isPaid = true;
    payment.actualPaymentDate = actualDate || new Date();
    document.lastModified = Date.now();
    return true;
  }
  
  return false;
};

// Method to get unpaid payments
/** @this {any} */
amortizationScheduleSchema.methods.getUnpaidPayments = function () {
  return this.schedule.filter((item) => !item.isPaid);
};

// Method to get next payment due
/** @this {any} */
amortizationScheduleSchema.methods.getNextPaymentDue = function () {
  const unpaid = this.getUnpaidPayments();
  if (unpaid.length === 0) return null;
  
  // Return the first unpaid payment
  return unpaid.sort((a, b) => a.paymentNumber - b.paymentNumber)[0];
};

// Method to calculate total paid amount
/** @this {any} */
amortizationScheduleSchema.methods.getTotalPaid = function () {
  return this.schedule
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.emiAmount, 0);
};

// Method to get payment statistics
/** @this {any} */
amortizationScheduleSchema.methods.getStatistics = function () {
  const paid = this.schedule.filter((item) => item.isPaid);
  const unpaid = this.schedule.filter((item) => !item.isPaid);
  
  return {
    totalPayments: this.schedule.length,
    paidPayments: paid.length,
    unpaidPayments: unpaid.length,
    totalPaid: paid.reduce((sum, item) => sum + item.emiAmount, 0),
    totalRemaining: unpaid.reduce((sum, item) => sum + item.emiAmount, 0),
    principalPaid: paid.reduce((sum, item) => sum + item.principalAmount, 0),
    interestPaid: paid.reduce((sum, item) => sum + item.interestAmount, 0),
    completionPercentage:
      this.schedule.length > 0
        ? Math.round((paid.length / this.schedule.length) * 100)
        : 0,
  };
};

// Ensure unique index on loanId
amortizationScheduleSchema.index({ loanId: 1 }, { unique: true });

const AmortizationSchedule = mongoose.model(
  "AmortizationSchedule",
  amortizationScheduleSchema
);

export default AmortizationSchedule;
