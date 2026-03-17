/**
 * QUICK WALLET CHECK
 * Simple 30-second test to verify wallet is working
 * Run: node test/quick-wallet-check.js
 * 
 * First install: npm install axios (if not already installed)
 */

import axios from "axios";

const API_URL = "http://localhost:5000/api";
const TEST_EMAIL = "quicktest@test.com";
const TEST_PASSWORD = "Test123!@#";

console.log("\n🔍 Quick Wallet System Check...\n");

async function quickCheck() {
  let token;
  
  try {
    // Step 1: Login or register
    console.log("1️⃣  Checking authentication...");
    try {
      const loginRes = await axios.post(`${API_URL}/users/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      token = loginRes.data.token;
      console.log("   ✅ Logged in successfully\n");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("   Creating test user...");
        await axios.post(`${API_URL}/users/register`, {
          name: "Quick Test User",
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });
        const loginRes = await axios.post(`${API_URL}/users/login`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });
        token = loginRes.data.token;
        console.log("   ✅ User created and logged in\n");
      } else {
        throw error;
      }
    }

    // Step 2: Check wallet
    console.log("2️⃣  Checking wallet...");
    const walletRes = await axios.get(`${API_URL}/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   ✅ Wallet found! Balance: $${walletRes.data.wallet.balance}\n`);

    // Step 3: Add funds
    console.log("3️⃣  Testing add funds...");
    const addRes = await axios.post(
      `${API_URL}/wallet/add-funds`,
      { amount: 100, paymentMethod: "card", cardLast4: "4242" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`   ✅ Added $100! New balance: $${addRes.data.wallet.balance}\n`);

    // Step 4: Check transactions
    console.log("4️⃣  Checking transaction history...");
    const txRes = await axios.get(`${API_URL}/wallet/transactions?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   ✅ Found ${txRes.data.transactions.length} transactions\n`);

    // Success
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ WALLET SYSTEM IS WORKING! ✅");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Next steps:");
    console.log("  • Open http://localhost:5173");
    console.log("  • Login and go to Tools → Wallet");
    console.log("  • Try adding funds with card: 4242 4242 4242 4242\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.response?.data?.message || error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("  1. Is backend running? (npm start in backend folder)");
    console.error("  2. Is MongoDB connected?");
    console.error("  3. Check backend terminal for errors\n");
    process.exit(1);
  }
}

quickCheck();
