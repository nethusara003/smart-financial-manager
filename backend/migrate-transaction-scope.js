import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "./models/Transaction.js";

dotenv.config();

const isDryRun = process.argv.includes("--dry-run");

const LEGACY_CATEGORY_RENAMES = {
  wallet_deposit: "wallet_topup",
  transfer_sent: "wallet_transfer_sent",
  transfer_received: "wallet_transfer_received",
};

const WALLET_TRANSFER_CATEGORIES = [
  "wallet_transfer_sent",
  "wallet_transfer_received",
  "wallet_transfer_reversal_in",
  "wallet_transfer_reversal_out",
];

const WALLET_MOVEMENT_CATEGORIES = ["wallet_topup", "wallet_withdrawal"];

const categoryTypeRules = {
  wallet_topup: "expense",
  wallet_withdrawal: "income",
  wallet_transfer_sent: "expense",
  wallet_transfer_received: "income",
  wallet_transfer_reversal_in: "income",
  wallet_transfer_reversal_out: "expense",
};

const categoryDirectionRules = {
  wallet_transfer_sent: "sent",
  wallet_transfer_received: "received",
  wallet_transfer_reversal_in: "received",
  wallet_transfer_reversal_out: "sent",
};

async function runStep(stepName, filter, update) {
  if (isDryRun) {
    const count = await Transaction.countDocuments(filter);
    console.log(`[DRY-RUN] ${stepName}: ${count} documents would be updated`);
    return count;
  }

  const result = await Transaction.updateMany(filter, update);
  const modified = result?.modifiedCount || 0;
  console.log(`${stepName}: ${modified} documents updated`);
  return modified;
}

async function migrateTransactionScope() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Aborting migration.");
    process.exit(1);
  }

  let updatedTotal = 0;

  try {
    console.log(`Connecting to MongoDB (${isDryRun ? "dry-run" : "write"} mode)...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const [fromCategory, toCategory] of Object.entries(LEGACY_CATEGORY_RENAMES)) {
      updatedTotal += await runStep(
        `Rename category ${fromCategory} -> ${toCategory}`,
        { category: fromCategory },
        { $set: { category: toCategory } }
      );
    }

    updatedTotal += await runStep(
      "Normalize wallet transfer scope + flags",
      { category: { $in: WALLET_TRANSFER_CATEGORIES } },
      {
        $set: {
          scope: "wallet",
          isTransfer: true,
          systemManaged: true,
        },
      }
    );

    updatedTotal += await runStep(
      "Normalize wallet topup/withdrawal scope + flags",
      { category: { $in: WALLET_MOVEMENT_CATEGORIES } },
      {
        $set: {
          scope: "savings",
          isTransfer: false,
          systemManaged: true,
        },
      }
    );

    for (const [category, requiredType] of Object.entries(categoryTypeRules)) {
      updatedTotal += await runStep(
        `Normalize type for ${category} -> ${requiredType}`,
        { category, type: { $ne: requiredType } },
        { $set: { type: requiredType } }
      );
    }

    for (const [category, direction] of Object.entries(categoryDirectionRules)) {
      updatedTotal += await runStep(
        `Normalize transfer direction for ${category} -> ${direction}`,
        { category, transferDirection: { $ne: direction } },
        { $set: { transferDirection: direction } }
      );
    }

    updatedTotal += await runStep(
      "Set default savings scope for records missing scope",
      { scope: { $exists: false } },
      { $set: { scope: "savings" } }
    );

    const walletScopedCount = await Transaction.countDocuments({ scope: "wallet" });
    const savingsScopedCount = await Transaction.countDocuments({ scope: "savings" });

    console.log("\nMigration summary:");
    console.log(`Total updates applied: ${updatedTotal}`);
    console.log(`Wallet scoped records: ${walletScopedCount}`);
    console.log(`Savings scoped records: ${savingsScopedCount}`);
    console.log(`Mode: ${isDryRun ? "dry-run (no writes)" : "write"}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

migrateTransactionScope();
