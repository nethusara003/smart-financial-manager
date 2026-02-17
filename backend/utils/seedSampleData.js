/**
 * Sample Data Generator for Intelligent Features
 * Generates realistic financial data for testing AI features
 * Run: node backend/utils/seedSampleData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Sample data configuration
const MONTHS_OF_DATA = 3; // Generate 3 months of historical data
const SAMPLE_USER = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'demo123',
  role: 'user'
};

// Expense categories with typical spending patterns
const EXPENSE_CATEGORIES = [
  { name: 'Groceries', avgAmount: 400, variance: 100, frequency: 8 }, // 8 times per month
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

// Income pattern
const INCOME_PATTERN = {
  salary: 4500, // Monthly salary
  freelance: 500, // Occasional freelance income
};

/**
 * Generate random amount with variance
 */
function randomAmount(base, variance) {
  return Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100;
}

/**
 * Generate random date within a month
 */
function randomDateInMonth(year, month, day = null) {
  if (day) return new Date(year, month, day);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  return new Date(year, month, randomDay);
}

/**
 * Create sample transactions
 */
async function createTransactions(userId) {
  console.log('📝 Generating transactions...');
  const transactions = [];
  const today = new Date();
  
  for (let monthOffset = 0; monthOffset < MONTHS_OF_DATA; monthOffset++) {
    const targetDate = new Date();
    targetDate.setMonth(today.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Add monthly salary (first day of month)
    transactions.push({
      user: userId,
      type: 'income',
      category: 'Salary',
      amount: INCOME_PATTERN.salary,
      note: 'Monthly salary',
      date: new Date(year, month, 1),
    });
    
    // Add occasional freelance income
    if (Math.random() > 0.5) {
      transactions.push({
        user: userId,
        type: 'income',
        category: 'Freelance',
        amount: randomAmount(INCOME_PATTERN.freelance, 200),
        note: 'Freelance project',
        date: randomDateInMonth(year, month),
      });
    }
    
    // Add expenses for each category
    for (const category of EXPENSE_CATEGORIES) {
      for (let i = 0; i < category.frequency; i++) {
        transactions.push({
          user: userId,
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
  console.log(`✅ Created ${transactions.length} transactions`);
}

/**
 * Create sample budgets
 */
async function createBudgets(userId) {
  console.log('💰 Generating budgets...');
  const budgets = [];
  const today = new Date();
  
  // Create budgets for the current month and next month
  for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
    const targetDate = new Date();
    targetDate.setMonth(today.getMonth() + monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const budgetCategories = [
      { category: 'Groceries', limit: 500 },
      { category: 'Dining Out', limit: 300 },
      { category: 'Transportation', limit: 200 },
      { category: 'Entertainment', limit: 150 },
      { category: 'Shopping', limit: 200 },
      { category: 'Utilities', limit: 250 },
      { category: 'Healthcare', limit: 150 },
    ];
    
    for (const budgetData of budgetCategories) {
      budgets.push({
        user: userId,
        category: budgetData.category,
        limit: budgetData.limit,
        month: month,
        year: year,
      });
    }
  }
  
  await Budget.insertMany(budgets);
  console.log(`✅ Created ${budgets.length} budgets`);
}

/**
 * Create sample goals
 */
async function createGoals(userId) {
  console.log('🎯 Generating financial goals...');
  const today = new Date();
  
  const goals = [
    {
      user: userId,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      deadline: new Date(today.getFullYear(), today.getMonth() + 12, 1),
      category: 'Savings',
    },
    {
      user: userId,
      name: 'Vacation Trip',
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: new Date(today.getFullYear(), today.getMonth() + 6, 1),
      category: 'Travel',
    },
    {
      user: userId,
      name: 'New Laptop',
      targetAmount: 1500,
      currentAmount: 800,
      deadline: new Date(today.getFullYear(), today.getMonth() + 3, 1),
      category: 'Technology',
    },
    {
      user: userId,
      name: 'Home Down Payment',
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: new Date(today.getFullYear() + 2, today.getMonth(), 1),
      category: 'Real Estate',
    },
  ];
  
  await Goal.insertMany(goals);
  console.log(`✅ Created ${goals.length} financial goals`);
}

/**
 * Create sample bills
 */
async function createBills(userId) {
  console.log('📄 Generating recurring bills...');
  const today = new Date();
  
  const bills = [
    {
      user: userId,
      name: 'Rent',
      amount: 1500,
      category: 'Rent',
      dueDate: 1,
      frequency: 'monthly',
      isPaid: false,
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
    },
    {
      user: userId,
      name: 'Electric Bill',
      amount: 120,
      category: 'Utilities',
      dueDate: 15,
      frequency: 'monthly',
      isPaid: false,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 15),
    },
    {
      user: userId,
      name: 'Internet',
      amount: 80,
      category: 'Utilities',
      dueDate: 5,
      frequency: 'monthly',
      isPaid: true,
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
    },
    {
      user: userId,
      name: 'Phone Bill',
      amount: 60,
      category: 'Utilities',
      dueDate: 10,
      frequency: 'monthly',
      isPaid: true,
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
    },
    {
      user: userId,
      name: 'Car Insurance',
      amount: 150,
      category: 'Insurance',
      dueDate: 20,
      frequency: 'monthly',
      isPaid: false,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 20),
    },
    {
      user: userId,
      name: 'Netflix',
      amount: 15.99,
      category: 'Subscriptions',
      dueDate: 12,
      frequency: 'monthly',
      isPaid: true,
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 12),
    },
    {
      user: userId,
      name: 'Gym Membership',
      amount: 45,
      category: 'Healthcare',
      dueDate: 1,
      frequency: 'monthly',
      isPaid: true,
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
    },
  ];
  
  await Bill.insertMany(bills);
  console.log(`✅ Created ${bills.length} recurring bills`);
}

/**
 * Find or create demo user
 */
async function findOrCreateUser() {
  console.log('👤 Setting up demo user...');
  
  let user = await User.findOne({ email: SAMPLE_USER.email });
  
  if (user) {
    console.log(`✅ Found existing user: ${user.email}`);
    return user;
  }
  
  const hashedPassword = await bcrypt.hash(SAMPLE_USER.password, 10);
  user = await User.create({
    ...SAMPLE_USER,
    password: hashedPassword,
  });
  
  console.log(`✅ Created new user: ${user.email}`);
  console.log(`   Password: ${SAMPLE_USER.password}`);
  return user;
}

/**
 * Clear existing sample data for user
 */
async function clearExistingData(userId) {
  console.log('🧹 Clearing existing sample data...');
  
  await Transaction.deleteMany({ user: userId });
  await Budget.deleteMany({ user: userId });
  await Goal.deleteMany({ user: userId });
  await Bill.deleteMany({ user: userId });
  
  console.log('✅ Cleared existing data');
}

/**
 * Main execution
 */
async function seedSampleData() {
  try {
    console.log('🌱 Starting sample data generation...\n');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart_financial_manager';
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find or create demo user
    const user = await findOrCreateUser();
    console.log('');
    
    // Clear existing data
    await clearExistingData(user._id);
    console.log('');
    
    // Generate sample data
    await createTransactions(user._id);
    await createBudgets(user._id);
    await createGoals(user._id);
    await createBills(user._id);
    
    console.log('\n✨ Sample data generation complete!\n');
    console.log('📊 Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Password: ${SAMPLE_USER.password}`);
    console.log(`   Data Period: ${MONTHS_OF_DATA} months`);
    console.log('\n🎉 You can now log in and see all intelligent features in action!\n');
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedSampleData;
