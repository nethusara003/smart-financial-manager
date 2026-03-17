/**
 * Utility Script: Update Transfer Limits to 500000
 * 
 * This script updates all existing TransferLimit records to use the new
 * increased single transfer limit of 500000 instead of the old 10000/100000.
 * 
 * Run: node update-transfer-limits.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TransferLimit from './models/TransferLimit.js';

// Load environment variables
dotenv.config();

const updateTransferLimits = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔄 Updating transfer limits...');
    
    // Update all TransferLimit records with singleTransfer < 500000
    const result = await TransferLimit.updateMany(
      { 
        singleTransfer: { $lt: 500000 } 
      },
      { 
        $set: { 
          singleTransfer: 500000 
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} transfer limit records`);
    
    // Show updated records
    const updatedLimits = await TransferLimit.find({});
    
    console.log('\n📊 Current Transfer Limits:');
    console.log('─'.repeat(80));
    updatedLimits.forEach(limit => {
      console.log(`User ID: ${limit.user}`);
      console.log(`  Single Transfer: $${limit.singleTransfer.toLocaleString()}`);
      console.log(`  Daily Limit: $${limit.dailyLimit.toLocaleString()}`);
      console.log(`  Monthly Limit: $${limit.monthlyLimit.toLocaleString()}`);
      console.log(`  Status: ${limit.status}`);
      console.log('─'.repeat(80));
    });

    console.log('\n✅ Transfer limits update complete!');
    console.log('\n⚠️  IMPORTANT: Restart your backend server for changes to take effect!');
    
  } catch (error) {
    console.error('❌ Error updating transfer limits:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the update
updateTransferLimits();
