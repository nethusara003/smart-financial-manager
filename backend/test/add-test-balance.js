// @ts-nocheck
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

/**
 * Add test balance to test users for P2P transfer testing
 * This script creates income transactions to give users initial balance
 */
async function addTestBalance() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all test users (emails ending with @test.com)
    const users = await User.find({ 
      email: { $regex: '@test.com$', $options: 'i' } 
    });

    if (users.length === 0) {
      console.log('❌ No test users found with @test.com email addresses');
      console.log('💡 Create test users first using: node backend/test/create-test-users.js');
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} test user(s):\n`);

    for (const user of users) {
      // Check current balance
      const existingTransactions = await Transaction.find({ user: user._id });
      const currentBalance = existingTransactions.reduce((sum, tx) => {
        return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
      }, 0);

      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   Current Balance: $${currentBalance.toFixed(2)}`);

      // Add $5000 test income if balance is low
      if (currentBalance < 1000) {
        await Transaction.create({
          user: user._id,
          type: 'income',
          category: 'salary',
          amount: 5000,
          description: 'Test balance for P2P transfers',
          date: new Date()
        });
        
        console.log(`   ✅ Added $5,000.00 test income`);
        console.log(`   💰 New Balance: $${(currentBalance + 5000).toFixed(2)}\n`);
      } else {
        console.log(`   ℹ️  Balance sufficient, no funds added\n`);
      }
    }

    console.log('\n🎉 Test balance setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login to frontend: http://localhost:5174');
    console.log('   2. Navigate to Transfers page');
    console.log('   3. Start testing P2P transfers!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addTestBalance();
