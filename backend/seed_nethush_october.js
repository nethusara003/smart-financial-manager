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
const START_YEAR = 2025;
const START_MONTH = 9; // October (0-indexed)

const EXPENSE_CATEGORIES = [
  { name: 'Groceries', avgAmount: 400, variance: 100, frequency: 8 },
  { name: 'Dining Out', avgAmount: 60, variance: 30, frequency: 6 },
  { name: 'Transportation', avgAmount: 150, variance: 50, frequency: 4 },
  { name: 'Utilities', avgAmount: 200, variance: 30, frequency: 1 },
  { name: 'Entertainment', avgAmount: 80, variance: 40, frequency: 4 },
  { name: 'Shopping', avgAmount: 120, variance: 80, frequency: 3 },
  { name: 'Healthcare', avgAmount: 100, variance: 50, frequency: 2 },
  { name: 'Insurance', avgAmount: 300, variance: 0, frequency: 1 },
  { name: 'Rent', avgAmount: 1500, variance: 0, frequency: 1 },
  { name: 'Subscriptions', avgAmount: 50, variance: 10, frequency: 1 },
];

const INCOME_PATTERN = {
  salary: 4500,
  freelance: 500,
};

function randomAmount(base, variance) {
  return Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100;
}

function randomDateInMonth(year, month, day = null) {
  if (day) return new Date(year, month, day);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  return new Date(Date.UTC(year, month, randomDay, 12, 0, 0)); // Force midday UTC so it doesn't jump months on timezone
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_financial_manager_safe_clone');
    console.log('Connected to DB');

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    console.log(`Found user: ${user.email} (${user._id})`);

    // Clear old data for this user
    await Transaction.deleteMany({ user: user._id });
    await Budget.deleteMany({ user: user._id });
    await Goal.deleteMany({ user: user._id });
    await Bill.deleteMany({ user: user._id });
    console.log('Cleared existing data for user.');

    const transactions = [];
    
    // We want data from October 2025 up to April 2026.
    // October is month 9, April is month 3 (0-indexed).
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
      transactions.push({
        user: user._id,
        type: 'income',
        category: 'Salary',
        amount: INCOME_PATTERN.salary,
        note: 'Monthly salary',
        date: new Date(Date.UTC(year, month, 1, 12, 0, 0)),
      });
      
      if (Math.random() > 0.5) {
        transactions.push({
          user: user._id,
          type: 'income',
          category: 'Freelance',
          amount: randomAmount(INCOME_PATTERN.freelance, 200),
          note: 'Freelance project',
          date: randomDateInMonth(year, month),
        });
      }
      
      for (const category of EXPENSE_CATEGORIES) {
        for (let i = 0; i < category.frequency; i++) {
          transactions.push({
            user: user._id,
            type: 'expense',
            category: category.name,
            amount: randomAmount(category.avgAmount, category.variance),
            note: `${category.name} expense`,
            date: randomDateInMonth(year, month),
          });
        }
      }
    }
    
    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions starting from October 2025.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
}

run();
