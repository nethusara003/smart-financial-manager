import mongoose from "mongoose";

const LedgerEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    // Transaction type
    type: {
      type: String,
      enum: [
        "deposit",        // Add funds to wallet
        "withdrawal",     // Withdraw from wallet
        "transfer_out",   // Send money to another user
        "transfer_in",    // Receive money from another user
        "fee",           // Transaction fee
        "refund",        // Refund transaction
        "reversal",      // Reversal transaction
      ],
      required: true,
      index: true,
    },
    // Amount (positive for credit, negative for debit)
    amount: {
      type: Number,
      required: true,
    },
    // Currency
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      required: true,
    },
    // Balance after this transaction
    balanceAfter: {
      type: Number,
      required: true,
    },
    // Related references
    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transfer",
      index: true,
    },
    paymentIntentId: {
      type: String, // Stripe payment intent ID
      index: true,
      sparse: true,
    },
    // Description/notes
    description: {
      type: String,
      maxLength: 500,
    },
    // Metadata for additional info
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "completed",
      index: true,
    },
    // Error details if failed
    errorMessage: {
      type: String,
    },
    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    // Related party (for transfers)
    relatedParty: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userName: String,
      userEmail: String,
    },
    // IP address and user agent for security
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
LedgerEntrySchema.index({ user: 1, timestamp: -1 });
LedgerEntrySchema.index({ user: 1, type: 1 });
LedgerEntrySchema.index({ wallet: 1, timestamp: -1 });
LedgerEntrySchema.index({ paymentIntentId: 1 }, { unique: true, sparse: true });
LedgerEntrySchema.index({ transferId: 1 });

// Immutable - prevent updates after creation
LedgerEntrySchema.pre("save", function () {
  if (!this.isNew) {
    throw new Error("Ledger entries are immutable and cannot be modified");
  }
});

// Prevent deletion
LedgerEntrySchema.pre("deleteOne", function () {
  throw new Error("Ledger entries cannot be deleted");
});

LedgerEntrySchema.pre("deleteMany", function () {
  throw new Error("Ledger entries cannot be deleted");
});

// Virtual for formatted amount
LedgerEntrySchema.virtual("formattedAmount").get(function () {
  const sign = this.amount >= 0 ? "+" : "";
  return `${sign}${this.currency} ${this.amount.toFixed(2)}`;
});

// Method to check if this is a credit transaction
LedgerEntrySchema.methods.isCredit = function () {
  return this.amount > 0;
};

// Method to check if this is a debit transaction
LedgerEntrySchema.methods.isDebit = function () {
  return this.amount < 0;
};

export default mongoose.model("LedgerEntry", LedgerEntrySchema);
