import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BaseURL = 'http://localhost:5000/api';
const MongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-financial-tracker';

// Connect to MongoDB
await mongoose.connect(MongoURI);
console.log('✓ MongoDB connected');

// Define minimal schemas for creating data
const transactionSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  type: String,
  category: String,
  amount: Number,
  note: String,
  date: Date,
  tags: [String],
  recurring: Boolean,
  source: String,
  destination: String,
  status: { type: String, default: 'completed' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  settings: {
    currency: { type: String, default: 'USD' }
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
const User = mongoose.model('User', userSchema);

// Function to register user
async function registerUser(testUser) {
  try {
    const response = await axios.post(`${BaseURL}/users/register`, testUser);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw error;
  }
}

// Function to generate sample transactions
async function generateSampleTransactions(userId) {
  const MONTHS_OF_DATA = 3;
  const EXPENSE_CATEGORIES = [
    { name: 'Groceries', avgAmount: 400, variance: 100, frequency: 8 },
    { name: 'Dining Out', avgAmount: 60, variance: 30, frequency: 6 },
    { name: 'Transportation', avgAmount: 150, variance: 50, frequency: 4 },
    { name: 'Utilities', avgAmount: 200, variance: 30, frequency: 1 },
    { name: 'Entertainment', avgAmount: 80, variance: 40, frequency: 4 },
    { name: 'Rent', avgAmount: 1500, variance: 0, frequency: 1 },
  ];

  function randomAmount(base, variance) {
    return Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100;
  }

  const transactions = [];
  const today = new Date();
  let transactionCount = 0;

  for (let monthOffset = 0; monthOffset < MONTHS_OF_DATA; monthOffset++) {
    const targetDate = new Date();
    targetDate.setMonth(today.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    // Monthly salary
    const salaryDate = new Date(year, month, 1);
    if (salaryDate <= today) {
      transactions.push({
        user: userId,
        type: 'income',
        category: 'Salary',
        amount: 4500,
        note: 'Monthly salary',
        date: salaryDate,
      });
      transactionCount++;
    }

    // Expenses
    for (const category of EXPENSE_CATEGORIES) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 0; i < category.frequency; i++) {
        const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
        const txDate = new Date(year, month, randomDay);
        if (txDate <= today) {
          transactions.push({
            user: userId,
            type: 'expense',
            category: category.name,
            amount: randomAmount(category.avgAmount, category.variance),
            note: `${category.name} expense`,
            date: txDate,
          });
          transactionCount++;
        }
      }
    }
  }

  // Insert all transactions
  if (transactions.length > 0) {
    await Transaction.insertMany(transactions);
    console.log(`✓ Generated ${transactionCount} sample transactions`);
  }

  return transactionCount;
}

// Main function
async function collectMetrics() {
  try {
    const metrics = {
      collectTime: new Date().toISOString(),
    };

    console.log('\n=== METRICS COLLECTION ===\n');

    // Step 1: Register user
    console.log('1. Registering test user...');
    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phone: '1234567890'
    };

    let registerData, loginData;
    try {
      registerData = await registerUser(testUser);
      metrics.userId = registerData._id;
      console.log(`✓ User registered: ${testUser.email}`);

      // Now login to get JWT token
      loginData = await axios.post(`${BaseURL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      metrics.jwt = loginData.data.token;
      console.log(`✓ User logged in, JWT obtained`);
    } catch (error) {
      throw new Error(`Registration/Login failed: ${error.response?.data?.message || error.message}`);
    }

    // Step 2: Generate sample data directly in database
    console.log('\n2. Generating sample data...');
    const txCount = await generateSampleTransactions(metrics.userId);
    metrics.dataset = {
      transactionCount: txCount,
      userCount: 1,
      dataType: 'synthetic (3-month sample data)',
      timeframeMonths: 3
    };

    // Helper function for authenticated requests
    const authConfig = {
      headers: {
        Authorization: `Bearer ${metrics.jwt}`,
        'Content-Type': 'application/json'
      }
    };

    // Step 3: Get forecasting metrics
    console.log('\n3. Fetching forecasting metrics...');
    try {
      const forecastResponse = await axios.get(`${BaseURL}/forecasting/expenses?months=3`, authConfig);
      const forecast = forecastResponse.data;
      console.log('Forecast response:', JSON.stringify(forecast, null, 2).substring(0, 500));
      if (forecast.summary && forecast.summary.backtestQuality) {
        const bq = forecast.summary.backtestQuality;
        metrics.forecasting = {
          mae: bq.mae || 0,
          rmse: bq.rmse || 0,
          mape: bq.mape || 0,
          windows: bq.windows || 0,
          categories: forecast.categoryForecasts?.length || 0,
          confidenceMethod: forecast.confidenceModel?.method || 'unknown'
        };
        console.log(`✓ Forecasting metrics: MAE=${bq.mae}, RMSE=${bq.rmse}, MAPE=${bq.mape}%`);
      } else {
        console.log('No backtestQuality in response');
      }
    } catch (error) {
      console.error(`✗ Forecasting error: ${error.response?.data?.message || error.message}`);
      console.error('Response data:', JSON.stringify(error.response?.data).substring(0, 300));
    }

    // Step 4: Get retirement metrics
    console.log('\n4. Fetching retirement simulation...');
    try {
      const retirementInput = { years: 30, targetAmount: 500000 };
      const retirementResponse = await axios.post(`${BaseURL}/retirement/simulate`, retirementInput, authConfig);
      const sim = retirementResponse.data;
      console.log('Retirement response:', JSON.stringify(sim, null, 2).substring(0, 500));
      if (sim.simulation) {
        const mc = sim.simulation;
        metrics.retirement = {
          monteCarloSimulations: mc.allSimulations?.length || 1000,
          probabilityOfSuccess: mc.probabilityOfSuccess || 0,
          mean: mc.mean || 0,
          median: mc.median || 0,
          percentile90: mc.percentile90 || 0,
          mlSource: sim.predictions?.source || 'heuristic'
        };
        console.log(`✓ Monte Carlo: P(success)=${mc.probabilityOfSuccess * 100}%, Median=$${mc.median}`);
      } else {
        console.log('No simulation data in response');
      }
    } catch (error) {
      console.error(`✗ Retirement error: ${error.response?.data?.message || error.message}`);
      console.error('Response data:', JSON.stringify(error.response?.data).substring(0, 300));
    }

    // Step 5: Get feedback metrics
    console.log('\n5. Checking AI assistant feedback...');
    try {
      const feedbackResponse = await axios.get(`${BaseURL}/feedback`, authConfig);
      const feedback = feedbackResponse.data;
      if (feedback.stats) {
        metrics.aiAssistant = {
          totalFeedbacks: feedback.stats.totalFeedbacks || 0,
          averageRating: feedback.stats.averageRating || 0,
          status: 'System instrumented; no formal user study conducted'
        };
        console.log(`✓ Feedback: Total=${feedback.stats.totalFeedbacks}, Avg Rating=${feedback.stats.averageRating}/5`);
      }
    } catch (error) {
      console.error(`✗ Feedback error: ${error.response?.data?.message || error.message}`);
    }

    // Save metrics
    console.log('\n6. Saving metrics...');
    const fs = await import('fs');
    const outputPath = 'f:\\\\Smart Financial Tracker\\\\METRICS_COLLECTED.json';
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    console.log(`✓ Metrics saved to: ${outputPath}`);

    // Display summary
    console.log('\n=== SUMMARY FOR ABSTRACT ===\n');
    console.log('1. FORECASTING ERROR METRICS');
    console.log(`   - MAE: ${metrics.forecasting?.mae || 'N/A'}`);
    console.log(`   - RMSE: ${metrics.forecasting?.rmse || 'N/A'}`);
    console.log(`   - MAPE: ${metrics.forecasting?.mape || 'N/A'}%`);

    console.log('\n2. DATASET DETAILS');
    console.log(`   - Transactions: ${metrics.dataset?.transactionCount || 'N/A'}`);
    console.log(`   - Users: ${metrics.dataset?.userCount || 'N/A'}`);
    console.log(`   - Type: ${metrics.dataset?.dataType || 'N/A'}`);

    console.log('\n3. RETIREMENT MONTE CARLO');
    console.log(`   - Probability of success: ${(metrics.retirement?.probabilityOfSuccess * 100) || 'N/A'}%`);
    console.log(`   - Median outcome: $${metrics.retirement?.median || 'N/A'}`);

    console.log('\n4. AI ASSISTANT EVALUATION');
    console.log(`   - Feedback collected: ${metrics.aiAssistant?.totalFeedbacks || 'N/A'}`);
    console.log(`   - Average rating: ${metrics.aiAssistant?.averageRating || 'N/A'}/5`);

    console.log('\n✓ Done!\n');

  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
    process.exit(0);
  }
}

// Run
collectMetrics();
