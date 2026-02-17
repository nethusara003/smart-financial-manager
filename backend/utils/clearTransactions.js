import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

const clearTransactions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await Transaction.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} transactions`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearTransactions();
