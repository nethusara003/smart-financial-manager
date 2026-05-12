import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function testDB() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing");
    process.exit(1);
  }

  console.log("Connecting to:", MONGO_URI.replace(/:([^:@]+)@/, ":****@"));
  
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected successfully");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Try a simple count
    const User = mongoose.model("User", new mongoose.Schema({}));
    const userCount = await User.countDocuments();
    console.log("User count:", userCount);
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testDB();
