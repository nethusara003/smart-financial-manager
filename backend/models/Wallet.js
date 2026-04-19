import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      required: true,
    },
    // Pending balance (funds in processing)
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Available balance (balance - pending)
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Wallet status
    status: {
      type: String,
      enum: ["active", "frozen", "suspended", "closed"],
      default: "active",
      index: true,
    },
    // Frozen reason if wallet is frozen
    frozenReason: {
      type: String,
    },
    frozenAt: {
      type: Date,
    },
    // Last transaction timestamp
    lastTransactionAt: {
      type: Date,
    },
    // Version for optimistic locking
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups

// Virtual for total balance including pending
WalletSchema.virtual("totalBalance").get(function () {
  return this.balance + this.pendingBalance;
});

// Method to check if wallet can transact
WalletSchema.methods.canTransact = function () {
  return this.status === "active";
};

// Method to check if sufficient balance
WalletSchema.methods.hasSufficientBalance = function (amount) {
  return this.availableBalance >= amount;
};

// Pre-save hook to calculate available balance
WalletSchema.pre("save", function () {
  this.availableBalance = this.balance - this.pendingBalance;
});

export default mongoose.model("Wallet", WalletSchema);
