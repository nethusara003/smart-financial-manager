import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const uri = "mongodb://127.0.0.1:27017/smart_financial_manager_safe_clone";

async function run() {
  await mongoose.connect(uri);

  const users = await User.find({}, { name: 1, email: 1, role: 1 }).lean();
  const counts = await Transaction.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.count]));

  const report = users
    .map((user) => ({
      userId: String(user._id),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      transactions: countMap.get(String(user._id)) || 0,
    }))
    .sort((a, b) => b.transactions - a.transactions);

  console.log(report);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("diagnose failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
