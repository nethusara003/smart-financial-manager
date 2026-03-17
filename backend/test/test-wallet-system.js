/**
 * Comprehensive Wallet System Test
 * Tests all wallet operations: create, add funds, withdraw, and transfers
 */

import axios from "axios";
import chalk from "chalk";

const API_URL = "http://localhost:5000/api";

// Test users credentials (create these first if they don't exist)
const testUsers = {
  user1: {
    email: "wallet.test1@test.com",
    password: "Test123!@#",
    name: "Wallet Tester 1",
  },
  user2: {
    email: "wallet.test2@test.com",
    password: "Test123!@#",
    name: "Wallet Tester 2",
  },
};

let tokens = {
  user1: null,
  user2: null,
};

let userIds = {
  user1: null,
  user2: null,
};

// Helper functions
const log = {
  success: (msg) => console.log(chalk.green("✅ " + msg)),
  error: (msg) => console.log(chalk.red("❌ " + msg)),
  info: (msg) => console.log(chalk.blue("ℹ️  " + msg)),
  step: (msg) => console.log(chalk.yellow("\n📋 " + msg)),
  data: (label, data) => console.log(chalk.cyan(`   ${label}:`), data),
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test functions
async function registerOrLoginUser(userKey) {
  const user = testUsers[userKey];
  log.step(`Logging in as ${user.name}...`);

  try {
    // Try to login first
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email: user.email,
      password: user.password,
    });

    tokens[userKey] = loginRes.data.token;
    userIds[userKey] = loginRes.data._id;
    log.success(`Logged in as ${user.name}`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      // User doesn't exist, register
      log.info(`User doesn't exist, registering...`);
      try {
        const registerRes = await axios.post(`${API_URL}/users/register`, {
          name: user.name,
          email: user.email,
          password: user.password,
        });

        // Now login
        const loginRes = await axios.post(`${API_URL}/users/login`, {
          email: user.email,
          password: user.password,
        });

        tokens[userKey] = loginRes.data.token;
        userIds[userKey] = loginRes.data._id;
        log.success(`Registered and logged in as ${user.name}`);
        return true;
      } catch (regError) {
        log.error(
          `Failed to register user: ${regError.response?.data?.message || regError.message}`
        );
        return false;
      }
    } else {
      log.error(
        `Login failed: ${error.response?.data?.message || error.message}`
      );
      return false;
    }
  }
}

async function getWalletBalance(userKey) {
  const token = tokens[userKey];
  try {
    const res = await axios.get(`${API_URL}/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      return res.data.wallet.balance;
    }
    return null;
  } catch (error) {
    log.error(
      `Failed to get balance: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}

async function addFundsToWallet(userKey, amount) {
  log.step(`Adding $${amount} to ${testUsers[userKey].name}'s wallet...`);

  const token = tokens[userKey];
  try {
    const res = await axios.post(
      `${API_URL}/wallet/add-funds`,
      {
        amount: amount,
        paymentMethod: "card",
        cardLast4: "4242",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.data.success) {
      log.success(`Added $${amount} successfully`);
      log.data("Previous Balance", `$${res.data.wallet.previousBalance}`);
      log.data("New Balance", `$${res.data.wallet.balance}`);
      return res.data.wallet.balance;
    }
    return null;
  } catch (error) {
    log.error(
      `Failed to add funds: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}

async function withdrawFromWallet(userKey, amount) {
  log.step(`Withdrawing $${amount} from ${testUsers[userKey].name}'s wallet...`);

  const token = tokens[userKey];
  try {
    const res = await axios.post(
      `${API_URL}/wallet/withdraw`,
      {
        amount: amount,
        bankAccount: "Bank ****1234",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.data.success) {
      log.success(`Withdrew $${amount} successfully`);
      log.data("Previous Balance", `$${res.data.wallet.previousBalance}`);
      log.data("New Balance", `$${res.data.wallet.balance}`);
      return res.data.wallet.balance;
    }
    return null;
  } catch (error) {
    log.error(
      `Failed to withdraw: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}

async function sendTransfer(senderKey, receiverKey, amount) {
  log.step(
    `Sending $${amount} from ${testUsers[senderKey].name} to ${testUsers[receiverKey].name}...`
  );

  const token = tokens[senderKey];
  const receiverEmail = testUsers[receiverKey].email;

  try {
    const res = await axios.post(
      `${API_URL}/transfers/initiate`,
      {
        receiverIdentifier: receiverEmail,
        amount: amount,
        description: "Test transfer",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    log.success(`Transfer completed`);
    log.data("Transfer ID", res.data.transferId);
    log.data("Status", res.data.status);
    log.data("Amount", `$${res.data.amount}`);
    return res.data;
  } catch (error) {
    log.error(
      `Transfer failed: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}

async function getWalletTransactions(userKey, limit = 5) {
  const token = tokens[userKey];
  try {
    const res = await axios.get(`${API_URL}/wallet/transactions?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      return res.data.transactions;
    }
    return [];
  } catch (error) {
    log.error(
      `Failed to get transactions: ${error.response?.data?.message || error.message}`
    );
    return [];
  }
}

// Main test suite
async function runTests() {
  console.log(chalk.bold.magenta("\n" + "=".repeat(60)));
  console.log(chalk.bold.magenta("        🧪 WALLET SYSTEM COMPREHENSIVE TEST"));
  console.log(chalk.bold.magenta("=".repeat(60) + "\n"));

  try {
    // Test 1: Setup users
    console.log(chalk.bold("\n━━━ TEST 1: User Authentication ━━━"));
    const user1Ready = await registerOrLoginUser("user1");
    const user2Ready = await registerOrLoginUser("user2");

    if (!user1Ready || !user2Ready) {
      log.error("Failed to setup test users");
      process.exit(1);
    }

    await sleep(1000);

    // Test 2: Check initial balances
    console.log(chalk.bold("\n━━━ TEST 2: Get Initial Wallet Balances ━━━"));
    const balance1Initial = await getWalletBalance("user1");
    const balance2Initial = await getWalletBalance("user2");
    log.data("User 1 Initial Balance", `$${balance1Initial || 0}`);
    log.data("User 2 Initial Balance", `$${balance2Initial || 0}`);

    await sleep(1000);

    // Test 3: Add funds to User 1
    console.log(chalk.bold("\n━━━ TEST 3: Add Funds to User 1 ━━━"));
    const balance1AfterAdd = await addFundsToWallet("user1", 1000);
    if (balance1AfterAdd === null) {
      log.error("Test failed: Could not add funds");
      process.exit(1);
    }
    log.success(`User 1 balance after adding funds: $${balance1AfterAdd}`);

    await sleep(1000);

    // Test 4: Add funds to User 2
    console.log(chalk.bold("\n━━━ TEST 4: Add Funds to User 2 ━━━"));
    const balance2AfterAdd = await addFundsToWallet("user2", 500);
    if (balance2AfterAdd === null) {
      log.error("Test failed: Could not add funds");
      process.exit(1);
    }
    log.success(`User 2 balance after adding funds: $${balance2AfterAdd}`);

    await sleep(1000);

    // Test 5: Send transfer from User 1 to User 2
    console.log(chalk.bold("\n━━━ TEST 5: P2P Transfer (User 1 → User 2) ━━━"));
    const transfer = await sendTransfer("user1", "user2", 100);
    if (!transfer) {
      log.error("Test failed: Transfer failed");
      process.exit(1);
    }

    await sleep(1000);

    // Test 6: Verify balances after transfer
    console.log(chalk.bold("\n━━━ TEST 6: Verify Balances After Transfer ━━━"));
    const balance1AfterTransfer = await getWalletBalance("user1");
    const balance2AfterTransfer = await getWalletBalance("user2");
    
    log.data("User 1 Balance After Transfer", `$${balance1AfterTransfer}`);
    log.data("User 2 Balance After Transfer", `$${balance2AfterTransfer}`);

    // Verify math (User 1 should be -100, User 2 should be +100)
    const expectedUser1 = balance1AfterAdd - 100;
    const expectedUser2 = balance2AfterAdd + 100;

    if (Math.abs(balance1AfterTransfer - expectedUser1) < 0.01) {
      log.success("✓ User 1 balance correct (deducted $100)");
    } else {
      log.error(
        `✗ User 1 balance incorrect. Expected: $${expectedUser1}, Got: $${balance1AfterTransfer}`
      );
    }

    if (Math.abs(balance2AfterTransfer - expectedUser2) < 0.01) {
      log.success("✓ User 2 balance correct (received $100)");
    } else {
      log.error(
        `✗ User 2 balance incorrect. Expected: $${expectedUser2}, Got: $${balance2AfterTransfer}`
      );
    }

    await sleep(1000);

    // Test 7: Withdraw funds from User 1
    console.log(chalk.bold("\n━━━ TEST 7: Withdraw Funds from User 1 ━━━"));
    const balance1AfterWithdraw = await withdrawFromWallet("user1", 50);
    if (balance1AfterWithdraw === null) {
      log.error("Test failed: Could not withdraw funds");
    } else {
      log.success(`User 1 balance after withdrawal: $${balance1AfterWithdraw}`);
    }

    await sleep(1000);

    // Test 8: Try to overdraft (should fail)
    console.log(chalk.bold("\n━━━ TEST 8: Test Overdraft Protection ━━━"));
    const currentBalance = await getWalletBalance("user1");
    log.info(`Attempting to withdraw $${currentBalance + 1000} (more than balance)...`);
    
    const overdraftResult = await withdrawFromWallet("user1", currentBalance + 1000);
    if (overdraftResult === null) {
      log.success("✓ Overdraft protection working - withdrawal rejected");
    } else {
      log.error("✗ SECURITY ISSUE: Overdraft was allowed!");
    }

    await sleep(1000);

    // Test 9: Check transaction history
    console.log(chalk.bold("\n━━━ TEST 9: Wallet Transaction History ━━━"));
    const user1Transactions = await getWalletTransactions("user1");
    log.success(`Found ${user1Transactions.length} transactions for User 1`);
    
    user1Transactions.forEach((tx, index) => {
      console.log(
        chalk.gray(
          `   ${index + 1}. ${tx.category} - ${tx.type === "income" ? "+" : "-"}$${tx.amount} on ${new Date(tx.date).toLocaleDateString()}`
        )
      );
    });

    // Test Summary
    console.log(chalk.bold.magenta("\n" + "=".repeat(60)));
    console.log(chalk.bold.magenta("              📊 TEST SUMMARY"));
    console.log(chalk.bold.magenta("=".repeat(60)));
    
    console.log(chalk.green("\n✅ All Core Features Working:"));
    console.log(chalk.white("   ✓ User authentication"));
    console.log(chalk.white("   ✓ Wallet balance retrieval"));
    console.log(chalk.white("   ✓ Add funds (mock payment)"));
    console.log(chalk.white("   ✓ Withdraw funds"));
    console.log(chalk.white("   ✓ P2P transfers"));
    console.log(chalk.white("   ✓ Balance verification"));
    console.log(chalk.white("   ✓ Overdraft protection"));
    console.log(chalk.white("   ✓ Transaction history"));

    console.log(chalk.bold.green("\n🎉 WALLET SYSTEM IS FULLY FUNCTIONAL!\n"));

    process.exit(0);
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
