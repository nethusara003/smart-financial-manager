import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const uris = [
  "mongodb://127.0.0.1:27017/smart_financial_manager_safe_clone",
  "mongodb://127.0.0.1:27017/smart_financial_manager",
];

async function run() {
  for (const uri of uris) {
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(uri);

    const total = await Transaction.countDocuments({});
    const topUsers = await Transaction.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    console.log(`DB: ${uri}`);
    console.log(`  total transactions: ${total}`);
    console.log(
      "  top users:",
      topUsers.map((entry) => ({ user: String(entry._id), count: entry.count }))
    );
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("diagnose failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
