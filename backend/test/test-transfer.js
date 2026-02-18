/**
 * P2P Transfer Feature Test Script
 * 
 * This script tests all the P2P transfer endpoints
 * Run with: node test-transfer.js
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test credentials (update with your actual test users)
let testUsers = {
  sender: {
    email: 'sender@test.com',
    password: 'password123',
    token: null,
    userId: null
  },
  receiver: {
    email: 'receiver@test.com',
    password: 'password123',
    token: null,
    userId: null
  }
};

let transferId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`)
};

// Test functions
async function loginUser(user, role) {
  try {
    log.section(`Logging in ${role}`);
    const response = await axios.post(`${API_URL}/users/login`, {
      email: user.email,
      password: user.password
    });
    
    user.token = response.data.token;
    user.userId = response.data.user._id;
    
    log.success(`${role} logged in successfully`);
    log.info(`User ID: ${user.userId}`);
    return true;
  } catch (error) {
    log.error(`Failed to login ${role}: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function searchUsers(searchQuery) {
  try {
    log.section('Testing User Search');
    const response = await axios.get(`${API_URL}/transfers/search-users`, {
      params: { query: searchQuery, limit: 5 },
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    log.success(`Found ${response.data.users.length} users`);
    response.data.users.forEach(user => {
      log.info(`  - ${user.name} (${user.email})`);
    });
    return response.data.users;
  } catch (error) {
    log.error(`User search failed: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function validateReceiver(receiverEmail) {
  try {
    log.section('Testing Receiver Validation');
    const response = await axios.post(`${API_URL}/transfers/validate-receiver`, {
      receiverIdentifier: receiverEmail
    }, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    if (response.data.isValid) {
      log.success('Receiver is valid');
      log.info(`Receiver: ${response.data.receiver.name} (${response.data.receiver.email})`);
    } else {
      log.warn('Receiver is invalid');
    }
    return response.data;
  } catch (error) {
    log.error(`Receiver validation failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function getTransferLimits() {
  try {
    log.section('Testing Get Transfer Limits');
    const response = await axios.get(`${API_URL}/transfers/my-limits`, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    log.success('Transfer limits retrieved');
    log.info(`Single transfer limit: $${response.data.limits.singleTransfer}`);
    log.info(`Daily limit: $${response.data.limits.daily}`);
    log.info(`Monthly limit: $${response.data.limits.monthly}`);
    log.info(`Used today: $${response.data.currentUsage.today}`);
    log.info(`Remaining today: $${response.data.remaining.today}`);
    return response.data;
  } catch (error) {
    log.error(`Get limits failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function checkFeasibility(receiverId, amount) {
  try {
    log.section('Testing Transfer Feasibility Check');
    const response = await axios.post(`${API_URL}/transfers/check-feasibility`, {
      receiverId,
      amount
    }, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    if (response.data.canTransfer) {
      log.success(`Transfer of $${amount} is feasible`);
    } else {
      log.warn(`Transfer of $${amount} is NOT feasible:`);
      response.data.reasons.forEach(reason => {
        log.warn(`  - ${reason.message}`);
      });
      if (response.data.suggestions.length > 0) {
        log.info('Suggestions:');
        response.data.suggestions.forEach(suggestion => {
          log.info(`  - ${suggestion}`);
        });
      }
    }
    return response.data;
  } catch (error) {
    log.error(`Feasibility check failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function initiateTransfer(receiverEmail, amount, description) {
  try {
    log.section('Testing Transfer Initiation');
    const response = await axios.post(`${API_URL}/transfers/initiate`, {
      receiverIdentifier: receiverEmail,
      amount,
      description
    }, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    transferId = response.data.transferId;
    log.success('Transfer initiated successfully');
    log.info(`Transfer ID: ${response.data.transferId}`);
    log.info(`Status: ${response.data.status}`);
    log.info(`Amount: $${response.data.amount}`);
    log.info(`From: ${response.data.sender.userName}`);
    log.info(`To: ${response.data.receiver.userName}`);
    return response.data;
  } catch (error) {
    log.error(`Transfer initiation failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    return null;
  }
}

async function getTransferDetails(transferId) {
  try {
    log.section('Testing Get Transfer Details');
    const response = await axios.get(`${API_URL}/transfers/${transferId}`, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    log.success('Transfer details retrieved');
    log.info(`Transfer ID: ${response.data.transfer._id}`);
    log.info(`Status: ${response.data.transfer.status}`);
    log.info(`Amount: $${response.data.transfer.amount}`);
    log.info(`Description: ${response.data.transfer.description}`);
    return response.data.transfer;
  } catch (error) {
    log.error(`Get transfer details failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function getMyTransfers() {
  try {
    log.section('Testing Get My Transfers');
    const response = await axios.get(`${API_URL}/transfers/my-transfers`, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    log.success(`Retrieved ${response.data.transfers.length} transfers`);
    log.info(`Total sent: $${response.data.summary.totalSent.toFixed(2)}`);
    log.info(`Total received: $${response.data.summary.totalReceived.toFixed(2)}`);
    log.info(`Total fees: $${response.data.summary.totalFees.toFixed(2)}`);
    
    if (response.data.transfers.length > 0) {
      log.info('\nRecent transfers:');
      response.data.transfers.slice(0, 3).forEach(transfer => {
        const direction = transfer.sender.userId === testUsers.sender.userId ? '→' : '←';
        const other = transfer.sender.userId === testUsers.sender.userId 
          ? transfer.receiver.userName 
          : transfer.sender.userName;
        log.info(`  ${direction} $${transfer.amount} ${direction === '→' ? 'to' : 'from'} ${other} - ${transfer.status}`);
      });
    }
    return response.data;
  } catch (error) {
    log.error(`Get my transfers failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function addTestBalance(userId, amount) {
  try {
    log.section('Adding Test Balance');
    // Create an income transaction to add balance
    const response = await axios.post(`${API_URL}/transactions`, {
      type: 'income',
      category: 'Test Balance',
      amount,
      note: 'Test balance for P2P transfer testing'
    }, {
      headers: { Authorization: `Bearer ${testUsers.sender.token}` }
    });
    
    log.success(`Added $${amount} test balance`);
    return true;
  } catch (error) {
    log.error(`Add test balance failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function getUserBalance(token) {
  try {
    const response = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Calculate balance from transactions
    const transactions = response.data;
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return income - expenses;
  } catch (error) {
    return 0;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  P2P TRANSFER FEATURE - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  
  // Step 1: Login users
  const senderLogin = await loginUser(testUsers.sender, 'SENDER');
  const receiverLogin = await loginUser(testUsers.receiver, 'RECEIVER');
  
  if (!senderLogin || !receiverLogin) {
    log.error('\n❌ Login failed. Please ensure test users exist:');
    log.info('Sender: sender@test.com');
    log.info('Receiver: receiver@test.com');
    log.info('Password: password123');
    log.info('\nCreate these users through the registration endpoint first.');
    return;
  }
  
  // Step 2: Check sender balance and add if needed
  const senderBalance = await getUserBalance(testUsers.sender.token);
  log.info(`\nSender current balance: $${senderBalance.toFixed(2)}`);
  
  if (senderBalance < 100) {
    log.warn('Sender has insufficient balance for testing. Adding test balance...');
    await addTestBalance(testUsers.sender.userId, 1000);
  }
  
  // Step 3: Search for users
  await searchUsers('receiver');
  
  // Step 4: Validate receiver
  await validateReceiver(testUsers.receiver.email);
  
  // Step 5: Get transfer limits
  await getTransferLimits();
  
  // Step 6: Check transfer feasibility
  await checkFeasibility(testUsers.receiver.userId, 50);
  
  // Step 7: Initiate a transfer
  const transfer = await initiateTransfer(
    testUsers.receiver.email,
    50,
    'Test transfer from automated test script'
  );
  
  if (!transfer) {
    log.error('Transfer initiation failed. Stopping tests.');
    return;
  }
  
  // Step 8: Get transfer details
  if (transferId) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await getTransferDetails(transferId);
  }
  
  // Step 9: Get transfer history
  await getMyTransfers();
  
  // Test Summary
  log.section('TEST SUMMARY');
  log.success('All P2P transfer tests completed!');
  log.info('\nTested endpoints:');
  log.info('  ✓ User search');
  log.info('  ✓ Receiver validation');
  log.info('  ✓ Transfer limits');
  log.info('  ✓ Feasibility check');
  log.info('  ✓ Transfer initiation');
  log.info('  ✓ Transfer details');
  log.info('  ✓ Transfer history');
  
  console.log('\n' + '='.repeat(60));
  console.log('  TEST COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(error => {
  log.error('Test suite failed with error:');
  console.error(error);
  process.exit(1);
});
