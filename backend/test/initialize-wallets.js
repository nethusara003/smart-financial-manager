/**
 * Initialize wallets for all existing users
 * This script creates wallet entries for users who don't have one
 * Optionally migrates existing transaction balances to wallets
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const calculateUserBalance = async (userId) => {
  const transactions = await Transaction.find({ user: userId });
  
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  return income - expenses;
};

const initializeWallets = async () => {
  try {
    await connectDB();
    
    console.log("\n🔄 Starting wallet initialization...\n");
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);
    
    let created = 0;
    let existing = 0;
    let migrated = 0;
    
    for (const user of users) {
      // Check if wallet already exists
      let wallet = await Wallet.findOne({ user: user._id });
      
      if (wallet) {
        existing++;
        console.log(`✓ ${user.name} already has a wallet (Balance: $${wallet.balance.toFixed(2)})`);
        continue;
      }
      
      // Calculate balance from transactions
      const balance = await calculateUserBalance(user._id);
      
      // Create new wallet
      wallet = await Wallet.create({
        user: user._id,
        balance: balance > 0 ? balance : 0, // Only migrate positive balances
        currency: "USD",
        status: "active",
        lastTransaction: new Date(),
      });
      
      created++;
      
      if (balance > 0) {
        migrated++;
        console.log(`✨ Created wallet for ${user.name} with migrated balance: $${balance.toFixed(2)}`);
      } else {
        console.log(`✨ Created wallet for ${user.name} with $0.00 balance`);
      }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("📈 Wallet Initialization Complete!");
    console.log("=".repeat(60));
    console.log(`✅ Wallets created: ${created}`);
    console.log(`📋 Wallets already exist: ${existing}`);
    console.log(`💰 Balances migrated: ${migrated}`);
    console.log(`🚀 Total wallets: ${created + existing}`);
    console.log("=".repeat(60) + "\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error initializing wallets:", error);
    process.exit(1);
  }
};

initializeWallets();
