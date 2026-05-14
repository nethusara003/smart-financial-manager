import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_financial_manager';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create or find the demo user
    let user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
        role: 'user'
      });
      console.log('Created demo user: demo@example.com / password123');
    }

    // 2. Ensure wallet exists
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: user._id,
        balance: 5000,
        currency: 'USD',
        status: 'active'
      });
      console.log('Created wallet for demo user.');
    }

    // 3. Clear existing transactions for this user to avoid duplicates
    await Transaction.deleteMany({ user: user._id });

    // 4. Generate transactions
    const categories = {
      income: ['Salary', 'Freelance', 'Investment'],
      expense: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Transport', 'Dining Out']
    };

    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const isIncome = Math.random() > 0.7;
      const type = isIncome ? 'income' : 'expense';
      const categoryList = categories[type];
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      
      const amount = isIncome 
        ? Math.floor(Math.random() * 2000) + 1000 
        : Math.floor(Math.random() * 200) + 10;

      // Random date in the last 60 days
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));

      transactions.push({
        user: user._id,
        wallet: wallet._id,
        type,
        category,
        amount,
        description: `${category} transaction #${i}`,
        date,
        status: 'completed'
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Successfully seeded 50 transactions for ${user.email}`);

    // Update wallet balance based on transactions
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    wallet.balance = 5000 + totalIncome - totalExpense;
    await wallet.save();

    console.log('Wallet balance updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
