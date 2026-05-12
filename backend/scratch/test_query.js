import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function testQuery() {
  await mongoose.connect(MONGO_URI);
  
  const User = mongoose.model("User", new mongoose.Schema({ email: String }));
  const Transaction = mongoose.model("Transaction", new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, date: Date }));
  const Notification = mongoose.model("Notification", new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));

  const firstUser = await User.findOne();
  if (!firstUser) {
    console.log("No users found");
    return;
  }

  console.log("Testing queries for user:", firstUser.email, "ID:", firstUser._id);

  try {
    console.log("Querying Transactions...");
    const txCount = await Transaction.countDocuments({ user: firstUser._id });
    console.log("Transaction count:", txCount);
    
    const txs = await Transaction.find({ user: firstUser._id }).sort({ date: -1 }).limit(5);
    console.log("Sample transactions found:", txs.length);

    console.log("Querying Notifications...");
    const notifCount = await Notification.countDocuments({ userId: firstUser._id });
    console.log("Notification count:", notifCount);

  } catch (error) {
    console.error("❌ Query failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testQuery();
