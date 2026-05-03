import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';
import Goal from './models/Goal.js';
import Bill from './models/Bill.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const TARGET_EMAIL = 'nethushseshaan@gmail.com';

const EXPENSE_CATEGORIES = [
  { name: 'Groceries', base: 4500, variance: 2500, freq: 12 }, // More frequent trips
  { name: 'Dining Out', base: 2000, variance: 1500, freq: 15 }, // Eating out every other day
  { name: 'Transportation', base: 800, variance: 500, freq: 30 }, // Daily transport/Uber
  { name: 'Utilities', base: 5000, variance: 3000, freq: 3 }, // Electricity, Water, Internet
  { name: 'Entertainment', base: 3000, variance: 2000, freq: 6 }, // Movies, events
  { name: 'Shopping', base: 6000, variance: 4000, freq: 4 }, // Clothing, etc
  { name: 'Healthcare', base: 2500, variance: 1000, freq: 2 }, // Pharmacy
  { name: 'Rent', base: 45000, variance: 0, freq: 1 }, // Monthly rent
  { name: 'Subscriptions', base: 1500, variance: 500, freq: 3 }, // Netflix, Spotify, Gym
  { name: 'Personal Care', base: 2000, variance: 1000, freq: 3 }, // Salon, cosmetics
  { name: 'Education', base: 5000, variance: 2000, freq: 1 }, // Courses, books
  { name: 'Gifts', base: 3000, variance: 2000, freq: 1 } // Occasional gifts
];

function randomRoundedAmount(base, variance) {
  let val = base + (Math.random() - 0.5) * variance * 2;
  // Round to nearest 50 for realism (no cents)
  return Math.round(val / 50) * 50;
}

function randomDateInMonth(year, month, specificDay = null) {
  if (specificDay) return new Date(Date.UTC(year, month, specificDay, 12, 0, 0));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  return new Date(Date.UTC(year, month, randomDay, 12, 0, 0));
}

async function run() {
  try {
    // FORCE PRODUCTION URI
    await mongoose.connect(process.env.PROD_MONGO_URI);
    console.log('Connected to PROD DB');

    // Force context to smartfinancial DB to be safe
    const db = mongoose.connection.useDb('smartfinancial');

    // Since we're writing directly to prod with specific schema logic, we'll use mongoose models
    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    console.log(`Found user: ${user.email} (${user._id})`);

    // Wipe transactions for this user
    await Transaction.deleteMany({ user: user._id });
    console.log('Cleared existing transactions for user.');

    const transactions = [];
    
    // October 2025 to April 2026 (0-indexed months)
    const targetMonths = [
      { year: 2025, month: 9 }, // Oct
      { year: 2025, month: 10 }, // Nov
      { year: 2025, month: 11 }, // Dec
      { year: 2026, month: 0 }, // Jan
      { year: 2026, month: 1 }, // Feb
      { year: 2026, month: 2 }, // Mar
      { year: 2026, month: 3 }  // Apr
    ];
    
    for (const { year, month } of targetMonths) {
      // Income (Salary)
      transactions.push({
        user: user._id,
        type: 'income',
        category: 'Salary',
        amount: 150000,
        note: 'Monthly Salary',
        date: randomDateInMonth(year, month, 25), // Salary on 25th
      });
      
      // Random Freelance Income (More frequent)
      const freelanceCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 times a month
      for (let i = 0; i < freelanceCount; i++) {
        transactions.push({
          user: user._id,
          type: 'income',
          category: 'Freelance',
          amount: randomRoundedAmount(15000, 5000),
          note: 'Freelance project milestone',
          date: randomDateInMonth(year, month),
        });
      }

      // Investment Dividends / Interest (Occasional)
      if (Math.random() > 0.4) {
        transactions.push({
          user: user._id,
          type: 'income',
          category: 'Investments',
          amount: randomRoundedAmount(8000, 3000),
          note: 'Stock dividends / Bank interest',
          date: randomDateInMonth(year, month),
        });
      }

      // Side Hustle (Consulting / E-commerce)
      if (Math.random() > 0.3) {
        transactions.push({
          user: user._id,
          type: 'income',
          category: 'Side Hustle',
          amount: randomRoundedAmount(12000, 4000),
          note: 'E-commerce sales',
          date: randomDateInMonth(year, month),
        });
      }
      
      // Expenses
      for (const category of EXPENSE_CATEGORIES) {
        for (let i = 0; i < category.freq; i++) {
          transactions.push({
            user: user._id,
            type: 'expense',
            category: category.name,
            amount: randomRoundedAmount(category.base, category.variance),
            note: `${category.name} expense`,
            date: randomDateInMonth(year, month),
          });
        }
      }
    }
    
    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} highly realistic LKR transactions starting from Oct 2025.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
}

run();
