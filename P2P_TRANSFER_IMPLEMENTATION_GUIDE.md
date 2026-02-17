# Peer-to-Peer Money Transfer Feature - Implementation Guide

**Feature Name:** P2P Money Transfer System  
**Project:** Smart Financial Manager  
**Implementation Type:** Advanced Functional Feature  
**Technology Stack:** MERN (MongoDB, Express.js, React, Node.js)  
**Created:** February 18, 2026  
**Status:** Planning Phase

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Bank Account & Funding System](#bank-account--funding-system)
3. [Stage 1: Planning & Requirements Analysis](#stage-1-planning--requirements-analysis)
4. [Stage 2: Database Schema Design](#stage-2-database-schema-design)
5. [Stage 3: Backend API Architecture](#stage-3-backend-api-architecture)
6. [Stage 4: Business Logic Implementation](#stage-4-business-logic-implementation)
7. [Stage 5: Frontend UI/UX Design](#stage-5-frontend-uiux-design)
8. [Stage 6: Security & Validation](#stage-6-security--validation)
9. [Stage 7: Notification System](#stage-7-notification-system)
10. [Stage 8: Testing Strategy](#stage-8-testing-strategy)
11. [Stage 9: Deployment & Monitoring](#stage-9-deployment--monitoring)

---

## Feature Overview

### What is P2P Money Transfer?

A peer-to-peer money transfer system allows users within the Smart Financial Manager application to send and receive money directly between their accounts. This feature transforms the application from a personal finance tracker into a social finance platform.

### Key Differentiators from Basic CRUD

This is **NOT** just creating/reading/updating/deleting transfer records. This is a **functional financial feature** that includes:

- ✅ **Double-Entry Accounting**: Every transfer creates two transactions (debit & credit)
- ✅ **Balance Validation**: Real-time balance checking before transfer
- ✅ **Transaction Atomicity**: Both transactions succeed or both fail (no partial transfers)
- ✅ **Transfer Status Workflow**: Pending → Processing → Completed/Failed
- ✅ **User Discovery**: Find users by email/username/ID
- ✅ **Transfer Limits**: Daily/monthly transfer limits for security
- ✅ **Transfer History**: Comprehensive audit trail
- ✅ **Notifications**: Real-time alerts for sender and receiver
- ✅ **Transfer Reversals**: Ability to cancel/reverse transfers within timeframe
- ✅ **Fee Calculation**: Optional transfer fees (for premium features)
- ✅ **Multi-Currency**: Handle currency conversions if needed

### Business Requirements

**User Stories:**

1. **As a user**, I want to send money to another user by entering their email/username and amount
2. **As a user**, I want to receive notifications when someone sends me money
3. **As a user**, I want to see my transfer history (sent and received)
4. **As a user**, I want to cancel a pending transfer before it's processed
5. **As a user**, I want to request money from another user
6. **As a user**, I want to set up recurring transfers to specific users
7. **As an admin**, I want to monitor all transfers for fraud detection
8. **As an admin**, I want to set transfer limits for users

---

## Bank Account & Funding System

### Understanding the Money Flow

**IMPORTANT DECISION: Do you need bank account linking?**

The answer depends on your implementation approach:

---

### Approach 1: Internal Wallet System (RECOMMENDED for MVP)

**How it works:**
- Users have an **internal wallet/balance** within your application
- Money stays within your system (closed-loop)
- P2P transfers move money between user wallets
- No real bank accounts needed initially

**Pros:**
- ✅ Simpler to implement
- ✅ Faster transactions (instant)
- ✅ No payment gateway fees
- ✅ Full control over the system
- ✅ Perfect for academic project demonstration

**Cons:**
- ❌ Users need to "add money" to wallet first
- ❌ Not connected to real banking system
- ❌ Requires withdrawal mechanism for real-world use

**Implementation:**
```javascript
// Users have a virtual balance calculated from transactions
// Current implementation in your system already supports this!

// Add money to wallet (demo/testing)
POST /api/wallet/add-funds
Body: { amount: 1000, source: "demo" }

// This creates an income transaction
// Balance is calculated from all transactions
```

---

### Approach 2: Bank Account Linking (Advanced)

**How it works:**
- Users link their real bank accounts (or mock accounts for testing)
- Transfers can happen between app wallets AND bank accounts
- Integration with payment gateway (Stripe, Razorpay, Plaid)

**When to use:**
- Production-ready application
- Real money transfers
- Regulatory compliance needed

---

## Mock Bank Account Implementation

For **testing and demonstration purposes**, you should implement a mock bank account system. Here's how:

### Option A: Simple Mock Bank System (Fastest)

**No external dependencies - pure application logic**

#### 1. Mock Bank Account Schema

**File:** `backend/models/BankAccount.js`

```javascript
const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Mock Bank Details
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  routingNumber: {
    type: String,
    required: true
  },
  
  accountHolderName: {
    type: String,
    required: true
  },
  
  bankName: {
    type: String,
    required: true,
    enum: ['Mock Bank of America', 'Mock Chase Bank', 'Mock Wells Fargo', 'Mock Citibank']
  },
  
  accountType: {
    type: String,
    enum: ['checking', 'savings'],
    default: 'checking'
  },
  
  // Mock Balance (for testing)
  mockBalance: {
    type: Number,
    default: 10000  // Give users $10,000 in mock bank account
  },
  
  // Card Details (if using card-based funding)
  cardNumber: String,           // Last 4 digits only: **** **** **** 1234
  cardNumberFull: String,       // Encrypted full number
  expiryMonth: String,
  expiryYear: String,
  cvv: String,                  // Encrypted, never store plain
  
  // Status
  isVerified: {
    type: Boolean,
    default: true  // Auto-verify for mock accounts
  },
  
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastUsed: Date
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
```

#### 2. Dummy Card Numbers for Testing

**Use these test card numbers (Stripe/Razorpay standard test cards):**

```javascript
// Test Card Numbers
const MOCK_CARD_NUMBERS = {
  visa: {
    success: '4242424242424242',
    decline: '4000000000000002',
    insufficient_funds: '4000000000009995',
    description: 'Visa - Always succeeds'
  },
  
  mastercard: {
    success: '5555555555554444',
    decline: '5100000000000008',
    description: 'Mastercard - Always succeeds'
  },
  
  amex: {
    success: '378282246310005',
    decline: '371449635398431',
    description: 'American Express'
  },
  
  discover: {
    success: '6011111111111117',
    description: 'Discover'
  },
  
  // Special test cases
  test_cases: {
    '4000000000000069': 'Card expired',
    '4000000000000127': 'Incorrect CVC',
    '4000000000000119': 'Processing error',
    '4000000000000341': '3D Secure required'
  }
};

// Test CVV: Use any 3 digits (e.g., 123)
// Test Expiry: Any future date (e.g., 12/28)
```

#### 3. Mock Bank Account API Endpoints

**File:** `backend/routes/bankAccountRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addBankAccount,
  getBankAccounts,
  verifyBankAccount,
  removeBankAccount,
  setPrimaryAccount,
  addFundsFromBank,
  withdrawToBank
} = require('../controllers/bankAccountController');

// Bank account management
router.post('/add', protect, addBankAccount);
router.get('/my-accounts', protect, getBankAccounts);
router.post('/:accountId/verify', protect, verifyBankAccount);
router.delete('/:accountId', protect, removeBankAccount);
router.patch('/:accountId/set-primary', protect, setPrimaryAccount);

// Funding operations
router.post('/add-funds', protect, addFundsFromBank);
router.post('/withdraw', protect, withdrawToBank);

module.exports = router;
```

#### 4. Mock Bank Controller

**File:** `backend/controllers/bankAccountController.js`

```javascript
const BankAccount = require('../models/BankAccount');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * Add a mock bank account
 * POST /api/bank-accounts/add
 */
const addBankAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cardNumber, expiryMonth, expiryYear, cvv, accountHolderName } = req.body;
    
    // Validate test card number
    const validTestCards = [
      '4242424242424242',  // Visa
      '5555555555554444',  // Mastercard
      '378282246310005',   // Amex
      '6011111111111117'   // Discover
    ];
    
    if (!validTestCards.includes(cardNumber)) {
      return res.status(400).json({
        message: 'Invalid test card number. Use one of the provided test cards.',
        validCards: {
          visa: '4242424242424242',
          mastercard: '5555555555554444',
          amex: '378282246310005',
          discover: '6011111111111117'
        }
      });
    }
    
    // Get card type
    const cardType = cardNumber.startsWith('4') ? 'Visa' :
                     cardNumber.startsWith('5') ? 'Mastercard' :
                     cardNumber.startsWith('3') ? 'Amex' : 'Discover';
    
    // Generate mock account number
    const accountNumber = 'MOCK' + Date.now() + Math.floor(Math.random() * 1000);
    const routingNumber = '110000000'; // Mock routing number
    
    // Determine bank name based on card
    const bankNames = [
      'Mock Bank of America',
      'Mock Chase Bank',
      'Mock Wells Fargo',
      'Mock Citibank'
    ];
    const bankName = bankNames[Math.floor(Math.random() * bankNames.length)];
    
    // Create bank account
    const bankAccount = await BankAccount.create({
      user: userId,
      accountNumber,
      routingNumber,
      accountHolderName: accountHolderName || req.user.name,
      bankName,
      accountType: 'checking',
      mockBalance: 10000,  // $10,000 starting balance
      cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
      cardNumberFull: cardNumber,  // In production, encrypt this
      expiryMonth,
      expiryYear,
      cvv,  // In production, encrypt this
      isVerified: true,   // Auto-verify for mock
      isPrimary: false
    });
    
    // If this is the first bank account, make it primary
    const accountCount = await BankAccount.countDocuments({ user: userId });
    if (accountCount === 1) {
      bankAccount.isPrimary = true;
      await bankAccount.save();
    }
    
    res.status(201).json({
      message: 'Mock bank account added successfully',
      bankAccount: {
        _id: bankAccount._id,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        accountType: bankAccount.accountType,
        cardNumber: bankAccount.cardNumber,
        mockBalance: bankAccount.mockBalance,
        isPrimary: bankAccount.isPrimary
      }
    });
    
  } catch (error) {
    console.error('Add bank account error:', error);
    res.status(500).json({ message: 'Failed to add bank account' });
  }
};

/**
 * Get user's bank accounts
 * GET /api/bank-accounts/my-accounts
 */
const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const accounts = await BankAccount.find({ user: userId })
      .select('-cardNumberFull -cvv')  // Don't send sensitive data
      .sort({ isPrimary: -1, createdAt: -1 });
    
    res.status(200).json({ accounts });
    
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Failed to fetch bank accounts' });
  }
};

/**
 * Add funds from bank account to app wallet
 * POST /api/bank-accounts/add-funds
 */
const addFundsFromBank = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bankAccountId, amount } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (amount > 10000) {
      return res.status(400).json({ 
        message: 'Maximum funding limit is $10,000 per transaction' 
      });
    }
    
    // Find bank account
    const bankAccount = await BankAccount.findOne({
      _id: bankAccountId,
      user: userId,
      status: 'active'
    });
    
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Check mock bank balance
    if (bankAccount.mockBalance < amount) {
      return res.status(400).json({
        message: 'Insufficient funds in bank account',
        available: bankAccount.mockBalance
      });
    }
    
    // Simulate processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create funding transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'income',
      category: 'bank_deposit',
      amount: amount,
      note: `Funds added from ${bankAccount.bankName} (${bankAccount.cardNumber})`,
      date: new Date(),
      metadata: {
        source: 'bank_account',
        bankAccountId: bankAccount._id,
        bankName: bankAccount.bankName
      }
    });
    
    // Update mock bank balance
    bankAccount.mockBalance -= amount;
    bankAccount.lastUsed = new Date();
    await bankAccount.save();
    
    res.status(201).json({
      message: 'Funds added successfully',
      transaction,
      newWalletBalance: await calculateUserBalance(userId),
      remainingBankBalance: bankAccount.mockBalance
    });
    
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
};

/**
 * Withdraw funds to bank account
 * POST /api/bank-accounts/withdraw
 */
const withdrawToBank = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bankAccountId, amount } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Check wallet balance
    const currentBalance = await calculateUserBalance(userId);
    
    if (currentBalance < amount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
        available: currentBalance
      });
    }
    
    // Find bank account
    const bankAccount = await BankAccount.findOne({
      _id: bankAccountId,
      user: userId,
      status: 'active'
    });
    
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'expense',
      category: 'bank_withdrawal',
      amount: amount,
      note: `Withdrawn to ${bankAccount.bankName} (${bankAccount.cardNumber})`,
      date: new Date(),
      metadata: {
        destination: 'bank_account',
        bankAccountId: bankAccount._id,
        bankName: bankAccount.bankName
      }
    });
    
    // Update mock bank balance (money goes back to bank)
    bankAccount.mockBalance += amount;
    bankAccount.lastUsed = new Date();
    await bankAccount.save();
    
    res.status(201).json({
      message: 'Withdrawal successful',
      transaction,
      newWalletBalance: await calculateUserBalance(userId),
      newBankBalance: bankAccount.mockBalance
    });
    
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
};

// Helper function
const calculateUserBalance = async (userId) => {
  const transactions = await Transaction.find({ user: userId });
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return income - expenses;
};

// Export other functions
const verifyBankAccount = async (req, res) => {
  // Already verified in mock system
  res.status(200).json({ message: 'Bank account verified' });
};

const removeBankAccount = async (req, res) => {
  try {
    await BankAccount.findByIdAndDelete(req.params.accountId);
    res.status(200).json({ message: 'Bank account removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove bank account' });
  }
};

const setPrimaryAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const accountId = req.params.accountId;
    
    // Remove primary from all accounts
    await BankAccount.updateMany(
      { user: userId },
      { isPrimary: false }
    );
    
    // Set new primary
    await BankAccount.findByIdAndUpdate(accountId, { isPrimary: true });
    
    res.status(200).json({ message: 'Primary account updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update primary account' });
  }
};

module.exports = {
  addBankAccount,
  getBankAccounts,
  verifyBankAccount,
  removeBankAccount,
  setPrimaryAccount,
  addFundsFromBank,
  withdrawToBank
};
```

#### 5. Frontend: Add Bank Account UI

**File:** `frontend/src/pages/BankAccounts.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    accountHolderName: ''
  });

  const testCards = [
    { type: 'Visa', number: '4242424242424242' },
    { type: 'Mastercard', number: '5555555555554444' },
    { type: 'Amex', number: '378282246310005' },
    { type: 'Discover', number: '6011111111111117' }
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bank-accounts/my-accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/bank-accounts/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Bank account added successfully!');
      setShowAddForm(false);
      fetchAccounts();
      
      // Reset form
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        accountHolderName: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add bank account');
    }
  };

  const useTestCard = (cardNumber) => {
    setFormData({
      ...formData,
      cardNumber,
      expiryMonth: '12',
      expiryYear: '28',
      cvv: '123'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bank Accounts</h1>

      {/* Test Cards Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">🧪 Test Card Numbers</h3>
        <p className="text-sm text-gray-600 mb-3">
          Use these test cards to add mock bank accounts:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {testCards.map(card => (
            <button
              key={card.type}
              onClick={() => useTestCard(card.number)}
              className="bg-white border rounded px-3 py-2 text-sm hover:bg-blue-100 text-left"
            >
              <strong>{card.type}:</strong> {card.number}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">My Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-500">No bank accounts added yet.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map(account => (
              <div key={account._id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{account.bankName}</h3>
                    <p className="text-sm text-gray-600">
                      {account.cardNumber} • {account.accountType}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Mock Balance: ${account.mockBalance.toFixed(2)}
                    </p>
                  </div>
                  {account.isPrimary && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Bank Account
        </button>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <div className="border rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Add Mock Bank Account</h3>
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                placeholder="4242424242424242"
                maxLength="16"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Month
                </label>
                <input
                  type="text"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                  placeholder="12"
                  maxLength="2"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Year
                </label>
                <input
                  type="text"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                  placeholder="28"
                  maxLength="2"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                  placeholder="123"
                  maxLength="4"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                placeholder="John Doe"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
```

---

### Option B: Integration with Real Payment Gateway (Advanced)

**For production or advanced demonstration**

#### Using Stripe Test Mode

**1. Install Stripe:**
```bash
npm install stripe
```

**2. Backend Integration:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment method
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2028,
    cvc: '123',
  },
});

// Create payment intent for adding funds
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // Convert to cents
  currency: 'usd',
  payment_method: paymentMethod.id,
  confirm: true,
});
```

#### Using Razorpay Test Mode (India)

**1. Install Razorpay:**
```bash
npm install razorpay
```

**2. Test Cards:**
```javascript
// Razorpay test cards
const RAZORPAY_TEST_CARDS = {
  success: {
    number: '4111111111111111',
    cvv: '123',
    expiry: '12/28'
  },
  failure: {
    number: '4012001037141112',
    cvv: '123',
    expiry: '12/28'
  }
};
```

---

### Option C: Stripe Test Mode + Internal Wallet (PRODUCTION-READY Architecture)

**⭐ RECOMMENDED for Advanced Final Year Projects**

This approach combines the security and realism of Stripe payments with the speed of internal wallet transfers. It demonstrates enterprise-level architecture and is what companies like Venmo, Cash App, and PayPal use internally.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - Payment Form                                             │
│  - Wallet Balance Display                                   │
│  - Transaction History                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  Backend API Layer (Express)                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Payment    │  │    Wallet    │  │    Ledger    │    │
│  │   Service    │  │   Service    │  │   Service    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          │                  │                  │
      ┌───▼──────┐      ┌────▼──────┐     ┌────▼──────┐
      │  Stripe  │      │ MongoDB   │     │ MongoDB   │
      │   API    │      │ Wallet    │     │ Ledger    │
      │          │      │Collection │     │Collection │
      └──────────┘      └───────────┘     └───────────┘
          │
          │ Webhook (async)
          │
      ┌───▼──────────────────────────────┐
      │  Webhook Handler                 │
      │  - Verify signature              │
      │  - Idempotency check             │
      │  - Update wallet atomically      │
      └──────────────────────────────────┘
```

---

## System Components

### 1. Payment Service Layer

**Purpose:** Handle all Stripe payment operations

**File:** `backend/services/paymentService.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  /**
   * Create a payment intent for wallet funding
   * @param {Object} params - Payment parameters
   * @returns {Promise<Object>} Payment intent
   */
  async createPaymentIntent({ userId, amount, currency = 'usd' }) {
    try {
      // Validate amount
      if (amount < 1 || amount > 10000) {
        throw new Error('Amount must be between $1 and $10,000');
      }

      // Create idempotency key (prevents duplicate charges)
      const idempotencyKey = `wallet_fund_${userId}_${Date.now()}`;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            userId: userId.toString(),
            type: 'wallet_funding',
            timestamp: new Date().toISOString()
          },
          description: `Add funds to wallet - User ${userId}`,
          automatic_payment_methods: {
            enabled: true,
          },
        },
        {
          idempotencyKey // Prevents duplicate charges if request is retried
        }
      );

      // Log payment intent creation
      console.log(`Payment intent created: ${paymentIntent.id} for user ${userId}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };

    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent details
   * @param {String} paymentIntentId
   * @returns {Promise<Object>}
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Raw request body
   * @param {String} signature - Stripe signature header
   * @returns {Object|null} Verified event or null
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  /**
   * Handle successful payment
   * @param {Object} paymentIntent
   * @returns {Promise<Object>}
   */
  async handleSuccessfulPayment(paymentIntent) {
    const { id, amount, currency, metadata } = paymentIntent;
    
    return {
      paymentIntentId: id,
      userId: metadata.userId,
      amount: amount / 100,
      currency,
      status: 'succeeded',
      timestamp: new Date()
    };
  }
}

module.exports = new PaymentService();
```

---

### 2. Wallet Service Layer

**Purpose:** Manage user wallet balances with atomic operations

**File:** `backend/services/walletService.js`

```javascript
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const LedgerService = require('./ledgerService');

class WalletService {
  /**
   * Get or create user wallet
   * @param {ObjectId} userId
   * @returns {Promise<Object>}
   */
  async getOrCreateWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        currency: 'usd',
        status: 'active'
      });
    }
    
    return wallet;
  }

  /**
   * Get wallet balance
   * @param {ObjectId} userId
   * @returns {Promise<Number>}
   */
  async getBalance(userId) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  /**
   * Add funds to wallet (atomic operation)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async creditWallet({ 
    userId, 
    amount, 
    paymentIntentId, 
    description,
    metadata = {} 
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check for idempotency - prevent duplicate credits
      const existingLedger = await LedgerService.findByPaymentIntent(
        paymentIntentId,
        session
      );

      if (existingLedger) {
        console.log(`Duplicate credit attempt detected: ${paymentIntentId}`);
        await session.abortTransaction();
        session.endSession();
        
        return {
          success: false,
          message: 'Payment already processed',
          wallet: await Wallet.findOne({ user: userId })
        };
      }

      // Find and update wallet atomically
      const wallet = await Wallet.findOneAndUpdate(
        { user: userId },
        { 
          $inc: { balance: amount },
          $set: { lastUpdated: new Date() }
        },
        { 
          new: true,
          upsert: true,
          session 
        }
      );

      // Create immutable ledger entry
      const ledgerEntry = await LedgerService.recordTransaction({
        userId,
        type: 'credit',
        amount,
        category: 'payment_deposit',
        description: description || `Funds added via Stripe`,
        paymentIntentId,
        balanceBefore: wallet.balance - amount,
        balanceAfter: wallet.balance,
        metadata,
        session
      });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      console.log(`Wallet credited: User ${userId}, Amount $${amount}, New Balance $${wallet.balance}`);

      return {
        success: true,
        wallet,
        ledgerEntry,
        message: 'Funds added successfully'
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      console.error('Wallet credit failed:', error);
      throw error;
    }
  }

  /**
   * Deduct funds from wallet (for P2P transfers, withdrawals)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async debitWallet({ 
    userId, 
    amount, 
    description,
    referenceId,
    metadata = {} 
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get current wallet
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check sufficient balance
      if (wallet.balance < amount) {
        throw new Error(`Insufficient balance. Available: $${wallet.balance}, Required: $${amount}`);
      }

      // Deduct funds atomically
      wallet.balance -= amount;
      wallet.lastUpdated = new Date();
      await wallet.save({ session });

      // Record in ledger
      const ledgerEntry = await LedgerService.recordTransaction({
        userId,
        type: 'debit',
        amount,
        category: 'transfer_sent',
        description,
        referenceId,
        balanceBefore: wallet.balance + amount,
        balanceAfter: wallet.balance,
        metadata,
        session
      });

      await session.commitTransaction();
      session.endSession();

      console.log(`Wallet debited: User ${userId}, Amount $${amount}, New Balance $${wallet.balance}`);

      return {
        success: true,
        wallet,
        ledgerEntry
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Transfer between wallets (P2P transfer)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async transferBetweenWallets({ 
    fromUserId, 
    toUserId, 
    amount, 
    description,
    transferId 
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Debit sender
      const senderWallet = await Wallet.findOne({ user: fromUserId }).session(session);
      if (!senderWallet || senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      senderWallet.balance -= amount;
      await senderWallet.save({ session });

      // Credit receiver
      const receiverWallet = await Wallet.findOneAndUpdate(
        { user: toUserId },
        { 
          $inc: { balance: amount },
          $set: { lastUpdated: new Date() }
        },
        { 
          new: true,
          upsert: true,
          session 
        }
      );

      // Record both ledger entries
      await LedgerService.recordTransaction({
        userId: fromUserId,
        type: 'debit',
        amount,
        category: 'transfer_sent',
        description,
        referenceId: transferId,
        balanceBefore: senderWallet.balance + amount,
        balanceAfter: senderWallet.balance,
        metadata: { recipientId: toUserId },
        session
      });

      await LedgerService.recordTransaction({
        userId: toUserId,
        type: 'credit',
        amount,
        category: 'transfer_received',
        description,
        referenceId: transferId,
        balanceBefore: receiverWallet.balance - amount,
        balanceAfter: receiverWallet.balance,
        metadata: { senderId: fromUserId },
        session
      });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        senderBalance: senderWallet.balance,
        receiverBalance: receiverWallet.balance
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = new WalletService();
```

---

### 3. Ledger Service Layer

**Purpose:** Maintain immutable transaction history for auditing

**File:** `backend/services/ledgerService.js`

```javascript
const LedgerEntry = require('../models/LedgerEntry');

class LedgerService {
  /**
   * Record a ledger transaction
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async recordTransaction({
    userId,
    type,
    amount,
    category,
    description,
    paymentIntentId = null,
    referenceId = null,
    balanceBefore,
    balanceAfter,
    metadata = {},
    session = null
  }) {
    const ledgerEntry = {
      user: userId,
      type,
      amount,
      category,
      description,
      paymentIntentId,
      referenceId,
      balanceBefore,
      balanceAfter,
      metadata,
      timestamp: new Date(),
      ledgerVersion: 1
    };

    const entry = session
      ? await LedgerEntry.create([ledgerEntry], { session })
      : await LedgerEntry.create(ledgerEntry);

    return Array.isArray(entry) ? entry[0] : entry;
  }

  /**
   * Find ledger entry by payment intent (idempotency check)
   * @param {String} paymentIntentId
   * @param {Object} session - Mongoose session
   * @returns {Promise<Object|null>}
   */
  async findByPaymentIntent(paymentIntentId, session = null) {
    const query = LedgerEntry.findOne({ paymentIntentId });
    
    if (session) {
      query.session(session);
    }
    
    return await query;
  }

  /**
   * Get user's ledger history
   * @param {ObjectId} userId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getUserLedger(userId, options = {}) {
    const {
      limit = 50,
      skip = 0,
      startDate,
      endDate,
      type
    } = options;

    const query = { user: userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (type) {
      query.type = type;
    }

    const entries = await LedgerEntry.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return entries;
  }

  /**
   * Get ledger statistics
   * @param {ObjectId} userId
   * @returns {Promise<Object>}
   */
  async getLedgerStats(userId) {
    const stats = await LedgerEntry.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        total: stat.total,
        count: stat.count
      };
      return acc;
    }, {});
  }
}

module.exports = new LedgerService();
```

---

### 4. Database Models

#### Wallet Model

**File:** `backend/models/Wallet.js`

```javascript
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'usd',
    enum: ['usd', 'eur', 'gbp', 'inr']
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed'],
    default: 'active'
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookups
WalletSchema.index({ user: 1 });

module.exports = mongoose.model('Wallet', WalletSchema);
```

#### Ledger Entry Model

**File:** `backend/models/LedgerEntry.js`

```javascript
const mongoose = require('mongoose');

const LedgerEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'payment_deposit',
      'transfer_sent',
      'transfer_received',
      'bank_withdrawal',
      'refund',
      'fee',
      'adjustment'
    ]
  },
  
  description: {
    type: String,
    required: true
  },
  
  // For idempotency
  paymentIntentId: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Reference to transfer, withdrawal, etc.
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // Balance snapshots
  balanceBefore: {
    type: Number,
    required: true
  },
  
  balanceAfter: {
    type: Number,
    required: true
  },
  
  // Additional data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  ledgerVersion: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
LedgerEntrySchema.index({ user: 1, timestamp: -1 });
LedgerEntrySchema.index({ user: 1, type: 1 });
LedgerEntrySchema.index({ paymentIntentId: 1 }, { unique: true, sparse: true });

// Immutable - prevent updates after creation
LedgerEntrySchema.pre('save', function(next) {
  if (!this.isNew) {
    throw new Error('Ledger entries are immutable');
  }
  next();
});

module.exports = mongoose.model('LedgerEntry', LedgerEntrySchema);
```

---

### 5. Webhook Handler

**File:** `backend/controllers/webhookController.js`

```javascript
const PaymentService = require('../services/paymentService');
const WalletService = require('../services/walletService');

/**
 * Handle Stripe webhooks
 * POST /api/webhooks/stripe
 */
const handleStripeWebhook = async (req, res) => {
  // Get raw body (required for signature verification)
  const payload = req.body;
  const signature = req.headers['stripe-signature'];

  // Verify webhook signature
  const event = PaymentService.verifyWebhookSignature(
    JSON.stringify(payload),
    signature
  );

  if (!event) {
    console.error('Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`Webhook received: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        console.log(`Payment canceled: ${event.data.object.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  const { id, amount, currency, metadata } = paymentIntent;
  const userId = metadata.userId;

  console.log(`Processing successful payment: ${id} for user ${userId}`);

  try {
    // Credit user's wallet (with idempotency)
    const result = await WalletService.creditWallet({
      userId,
      amount: amount / 100, // Convert from cents
      paymentIntentId: id,
      description: `Stripe payment ${id}`,
      metadata: {
        currency,
        paymentMethod: paymentIntent.payment_method,
        timestamp: new Date().toISOString()
      }
    });

    if (result.success) {
      console.log(`Wallet credited successfully for user ${userId}`);
      
      // Optional: Send notification to user
      // await NotificationService.send({
      //   userId,
      //   type: 'payment_success',
      //   message: `$${amount / 100} added to your wallet`
      // });
    } else {
      console.log(`Duplicate payment already processed: ${id}`);
    }

  } catch (error) {
    console.error(`Failed to process payment ${id}:`, error);
    // In production, implement retry logic or alert admin
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  const { id, last_payment_error, metadata } = paymentIntent;
  const userId = metadata.userId;

  console.log(`Payment failed: ${id} for user ${userId}`, last_payment_error);

  // Optional: Notify user of failure
  // await NotificationService.send({
  //   userId,
  //   type: 'payment_failed',
  //   message: `Payment failed: ${last_payment_error?.message || 'Unknown error'}`
  // });
};

module.exports = {
  handleStripeWebhook
};
```

---

### 6. API Routes

**File:** `backend/routes/paymentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const PaymentService = require('../services/paymentService');
const WalletService = require('../services/walletService');

/**
 * Create payment intent
 * POST /api/payments/create-intent
 */
router.post('/create-intent', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 1 || amount > 10000) {
      return res.status(400).json({
        message: 'Amount must be between $1 and $10,000'
      });
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      userId,
      amount,
      currency: 'usd'
    });

    res.status(200).json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

/**
 * Get wallet balance
 * GET /api/payments/wallet/balance
 */
router.get('/wallet/balance', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const balance = await WalletService.getBalance(userId);

    res.status(200).json({ balance });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Failed to fetch balance' });
  }
});

/**
 * Get wallet transaction history
 * GET /api/payments/wallet/history
 */
router.get('/wallet/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    const LedgerService = require('../services/ledgerService');
    const history = await LedgerService.getUserLedger(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.status(200).json({ history });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

module.exports = router;
```

**File:** `backend/routes/webhookRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');

// Important: Use express.raw() for webhook routes to preserve raw body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

module.exports = router;
```

---

### 7. Environment Variables

**Add to `.env`:**

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Wallet Configuration
WALLET_CURRENCY=usd
MAX_WALLET_BALANCE=100000
MIN_DEPOSIT_AMOUNT=1
MAX_DEPOSIT_AMOUNT=10000
```

---

### 8. Frontend Integration

**Install Stripe.js:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**File:** `frontend/src/pages/AddFunds.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        '/api/payments/create-intent',
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Test Card: 4242 4242 4242 4242 | Any future expiry | Any CVC
      </div>
    </form>
  );
};

const AddFunds = () => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/payments/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleSuccess = (paymentIntent) => {
    alert('Payment successful! Your wallet will be updated shortly.');
    setShowPayment(false);
    setAmount('');
    
    // Wait a moment for webhook processing then refresh balance
    setTimeout(() => {
      fetchBalance();
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Funds to Wallet</h1>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
        <p className="text-sm opacity-80">Current Balance</p>
        <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
      </div>

      {!showPayment ? (
        <div className="bg-white border rounded-lg p-6">
          <label className="block text-sm font-medium mb-2">
            Amount to Add
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max="10000"
              step="0.01"
              className="flex-1 border rounded px-4 py-3 text-lg"
            />
            <button
              onClick={() => amount && setShowPayment(true)}
              disabled={!amount || amount < 1 || amount > 10000}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Continue
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map(preset => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="border rounded py-2 hover:bg-gray-100"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Add ${amount} to Wallet
          </h2>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              amount={parseFloat(amount)} 
              onSuccess={handleSuccess}
            />
          </Elements>

          <button
            onClick={() => setShowPayment(false)}
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

export default AddFunds;
```

---

### 9. Testing Strategy

#### Local Webhook Testing with Stripe CLI

**Install Stripe CLI:**
```bash
# Windows (using Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

**Forward webhooks to local server:**
```bash
stripe login
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# This will output a webhook signing secret
# Add it to your .env file as STRIPE_WEBHOOK_SECRET
```

**Trigger test events:**
```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

#### Test Cards

```javascript
// Success
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

// Declined
Card: 4000 0000 0000 0002

// Insufficient Funds
Card: 4000 0000 0000 9995

// 3D Secure Required
Card: 4000 0000 0000 3220
```

---

### 10. Server.js Integration

**Update:** `backend/server.js`

```javascript
const express = require('express');
const app = express();

// IMPORTANT: Webhook routes BEFORE express.json()
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Then add JSON parser
app.use(express.json());

// Other routes
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));
// ... existing routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Implementation Timeline

**Week 1:** Database models + Service layers (15-20 hours)
**Week 2:** API endpoints + Webhook handler (10-15 hours)  
**Week 3:** Frontend integration + Testing (12-18 hours)  
**Week 4:** Security hardening + Documentation (8-12 hours)

**Total:** ~45-65 hours of development time

---

## Advantages of This Architecture

✅ **Production-Ready:** Same architecture used by major fintech companies  
✅ **Secure:** Webhook verification, idempotency, atomic transactions  
✅ **Auditable:** Immutable ledger for compliance  
✅ **Scalable:** Service layers allow independent scaling  
✅ **Testable:** Stripe test mode + comprehensive test coverage  
✅ **Maintainable:** Clear separation of concerns  
✅ **Fast P2P:** Internal transfers are instant (no payment gateway involved)  
✅ **Realistic:** Real payment flow demonstration  

---

## Production Considerations

**When moving to production:**

1. **Switch Stripe Keys:** Test → Live mode
2. **Webhook Endpoint:** Use HTTPS with valid SSL
3. **Rate Limiting:** Add rate limits to payment endpoints
4. **Monitoring:** Set up error tracking (Sentry)
5. **Compliance:** Implement KYC/AML checks
6. **Backup:** Regular database backups with ledger verification
7. **Alerts:** Monitor for suspicious patterns
8. **Documentation:** API documentation for support team

---

**This architecture demonstrates enterprise-level software engineering skills perfect for a final year CS project!**

---

## Recommended Implementation Flow

### For Your P2P Transfer Feature:

**STEP 1: Start with Internal Wallet (No Bank Linking Required)**
- Users already have transactions in your system
- Calculate balance from existing transactions
- P2P transfers work within the app

**STEP 2: (Optional) Add Mock Bank System for Demonstration**
- Implement mock bank accounts as shown above
- Users can "add funds" from mock bank to wallet
- Users can "withdraw" from wallet to mock bank
- Makes the demo more realistic

**STEP 3: (Future) Real Payment Gateway Integration**
- Use Stripe/Razorpay test mode
- Real card validation
- Webhook handling
- Compliance features

---

## Quick Start Implementation

**Minimal setup for P2P transfers to work TODAY:**

1. **No bank accounts needed** - Users already have balances from transactions
2. **Add test data script** to give users initial balance:

```javascript
// Script: backend/scripts/addTestBalance.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');

async function addTestBalance(userId, amount) {
  await Transaction.create({
    user: userId,
    type: 'income',
    category: 'initial_balance',
    amount: amount,
    note: 'Test balance for P2P transfers',
    date: new Date()
  });
  
  console.log(`Added $${amount} to user ${userId}`);
}

// Give all users $5000 test balance
async function seedTestBalances() {
  const users = await User.find();
  
  for (const user of users) {
    await addTestBalance(user._id, 5000);
  }
  
  console.log('Test balances added to all users!');
}

seedTestBalances();
```

3. **P2P transfers work immediately** - money moves between user balances

---

## Summary

**DO YOU NEED BANK ACCOUNTS? No, not for basic P2P transfers.**

**Recommended approach:**
1. ✅ Start with internal wallet system (use existing transactions)
2. ✅ Add test balance script for demonstration
3. ✅ Implement P2P transfers
4. 🎯 (Optional) Add mock bank accounts for realism
5. 🚀 (Future) Integrate real payment gateway

The mock bank account system shown above is **optional but recommended** for a complete demonstration. It makes your project look more professional without the complexity of real payment gateway integration.

---

## Stage 1: Planning & Requirements Analysis

### 1.1 Feature Scope Definition

**Core Features (MVP):**
- Send money to registered users
- Receive money from other users
- View transfer history
- Basic validation (balance check, user verification)
- Transaction atomicity
- Transfer status tracking

**Advanced Features (Post-MVP):**
- Transfer requests (request money from someone)
- Scheduled/recurring transfers
- Transfer templates (save frequent recipients)
- Split transfers (split amount among multiple users)
- Transfer fees/commissions
- Transfer reversals/refunds
- Transfer disputes
- QR code-based transfers

**Admin Features:**
- Transfer monitoring dashboard
- Fraud detection alerts
- Transfer analytics
- User transfer limits management

### 1.2 User Flow Mapping

**Transfer Initiation Flow:**
```
User Dashboard
    ↓
Click "Send Money"
    ↓
Enter Recipient (email/username/search)
    ↓
System validates recipient exists
    ↓
Enter Amount
    ↓
System checks sender balance
    ↓
Add Note/Description (optional)
    ↓
Review Transfer Details
    ↓
Enter PIN/Password confirmation
    ↓
Submit Transfer
    ↓
System creates dual transactions atomically
    ↓
Update both user balances
    ↓
Send notifications to both parties
    ↓
Show success confirmation
    ↓
Redirect to transfer receipt
```

**Transfer Receiving Flow:**
```
Recipient receives notification
    ↓
Opens notification or app
    ↓
Views transfer details
    ↓
Money automatically credited to balance
    ↓
Can view in transaction history
    ↓
Can send thank you message (optional)
```

### 1.3 Technical Requirements

**Performance Requirements:**
- Transfer processing: < 2 seconds
- Balance calculation: Real-time
- Concurrent transfers: Handle at least 100 simultaneous transfers
- Database transactions: ACID compliance

**Security Requirements:**
- Authentication required for all transfer operations
- Transaction PIN for transfers above threshold amount
- Rate limiting: Max 10 transfers per minute per user
- Transfer amount limits: 
  - Single transfer: Maximum $10,000
  - Daily limit: $50,000
  - Monthly limit: $200,000
- Encryption for sensitive data
- Audit logging for all transfers

**Data Integrity Requirements:**
- Atomic transactions (MongoDB transactions)
- No partial transfers
- Balance consistency checks
- Idempotency (prevent duplicate transfers)

### 1.4 Success Metrics

**KPIs to Track:**
- Number of transfers per day/week/month
- Total transfer value
- Average transfer amount
- Transfer success rate (%)
- Transfer failure reasons
- Average processing time
- User adoption rate (% of users who have made a transfer)
- Repeat transfer rate

---

## Stage 2: Database Schema Design

### 2.1 Transfer Model Schema

**Collection Name:** `transfers`

```javascript
{
  _id: ObjectId,                           // Unique transfer ID
  
  // Transfer Parties
  sender: {
    userId: ObjectId (ref: "User"),       // Sender user ID
    userName: String,                      // Sender name (denormalized for quick access)
    userEmail: String                      // Sender email
  },
  
  receiver: {
    userId: ObjectId (ref: "User"),       // Receiver user ID
    userName: String,                      // Receiver name
    userEmail: String                      // Receiver email
  },
  
  // Transfer Details
  amount: Number (required, min: 0.01),   // Transfer amount
  currency: String (default: "USD"),       // Currency code
  fee: Number (default: 0),                // Transfer fee (if applicable)
  netAmount: Number,                       // Amount after fee deduction
  
  // Transfer Status
  status: String (enum: [
    "initiated",      // Transfer created, validation pending
    "pending",        // Validation passed, processing started
    "processing",     // Creating transactions
    "completed",      // Successfully completed
    "failed",         // Failed due to error
    "cancelled",      // Cancelled by user
    "reversed"        // Reversed/refunded
  ], default: "initiated"),
  
  // Transaction References
  senderTransactionId: ObjectId (ref: "Transaction"),   // Debit transaction ID
  receiverTransactionId: ObjectId (ref: "Transaction"), // Credit transaction ID
  
  // Transfer Metadata
  description: String (maxLength: 500),    // Optional note/description
  category: String (default: "transfer"),
  transferType: String (enum: [
    "standard",       // Regular transfer
    "request",        // Money request
    "recurring",      // Scheduled recurring
    "split"           // Split payment
  ], default: "standard"),
  
  // Security & Validation
  senderBalanceAtTransfer: Number,         // Sender balance snapshot
  validatedAt: Date,                       // When validation completed
  processedAt: Date,                       // When processing completed
  
  // Error Handling
  failureReason: String,                   // Reason if failed
  errorCode: String,                       // Error code for debugging
  
  // Reversal Information
  isReversible: Boolean (default: true),
  reversalDeadline: Date,                  // Deadline for reversal
  reversedAt: Date,                        // When reversed (if applicable)
  reversalReason: String,
  reversalInitiatedBy: ObjectId (ref: "User"),
  
  // Audit Trail
  ipAddress: String,                       // Request IP address
  userAgent: String,                       // User's browser/device
  deviceType: String (enum: ["web", "mobile", "api"]),
  
  // Metadata
  createdAt: Date (default: Date.now),
  updatedAt: Date,
  completedAt: Date
}
```

**Indexes:**
```javascript
// Performance indexes
{ "sender.userId": 1, "createdAt": -1 }        // Sender's transfer history
{ "receiver.userId": 1, "createdAt": -1 }      // Receiver's transfer history
{ "status": 1, "createdAt": -1 }               // Status-based queries
{ "createdAt": -1 }                            // Recent transfers

// Composite indexes
{ "sender.userId": 1, "status": 1, "createdAt": -1 }
{ "receiver.userId": 1, "status": 1, "createdAt": -1 }

// Text search index
{ "description": "text", "sender.userName": "text", "receiver.userName": "text" }
```

### 2.2 User Model Updates

**Add to existing User model:**

```javascript
// Add these fields to User schema
{
  // ... existing user fields ...
  
  // Transfer-specific fields
  transferSettings: {
    dailyLimit: Number (default: 50000),
    monthlyLimit: Number (default: 200000),
    singleTransferLimit: Number (default: 10000),
    requirePinAbove: Number (default: 1000),  // Amount threshold for PIN
    autoAcceptTransfers: Boolean (default: true),
    allowTransferRequests: Boolean (default: true),
    transferNotifications: Boolean (default: true)
  },
  
  // Transfer PIN (separate from password)
  transferPin: String (hashed),              // 4-6 digit PIN
  transferPinSetAt: Date,
  
  // Transfer Statistics
  transferStats: {
    totalSent: Number (default: 0),
    totalReceived: Number (default: 0),
    transferCount: Number (default: 0),
    lastTransferDate: Date
  },
  
  // Calculated Balance (virtual field)
  // This should be calculated from transactions in real-time
  currentBalance: Number (virtual field, not stored)
}
```

### 2.3 Transaction Model Updates

**Add to existing Transaction model:**

```javascript
// Add these fields to Transaction schema
{
  // ... existing transaction fields ...
  
  // Transfer-related fields
  isTransfer: Boolean (default: false),
  transferId: ObjectId (ref: "Transfer"),      // Link to transfer record
  transferDirection: String (enum: ["sent", "received"]),
  relatedUserId: ObjectId (ref: "User"),       // Other party in transfer
  relatedUserName: String,                      // Other party name
  
  // Override category for transfers
  category: String (when isTransfer=true, set to "transfer_sent" or "transfer_received")
}
```

### 2.4 TransferRequest Model (Advanced Feature)

**Collection Name:** `transferrequests`

```javascript
{
  _id: ObjectId,
  
  requester: {
    userId: ObjectId (ref: "User"),
    userName: String,
    userEmail: String
  },
  
  requestedFrom: {
    userId: ObjectId (ref: "User"),
    userName: String,
    userEmail: String
  },
  
  amount: Number (required),
  currency: String (default: "USD"),
  description: String,
  
  status: String (enum: [
    "pending",      // Waiting for response
    "accepted",     // Accepted, transfer initiated
    "declined",     // Declined by requested user
    "expired",      // Expired without response
    "cancelled"     // Cancelled by requester
  ], default: "pending"),
  
  transferId: ObjectId (ref: "Transfer"),  // If accepted and transfer created
  
  expiresAt: Date,                         // Request expiry (default: 7 days)
  respondedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 TransferLimit Model (Admin Feature)

**Collection Name:** `transferlimits`

```javascript
{
  _id: ObjectId,
  
  userId: ObjectId (ref: "User"),
  
  limits: {
    singleTransfer: Number,
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  
  currentUsage: {
    today: Number,
    thisWeek: Number,
    thisMonth: Number,
    lastResetDate: Date
  },
  
  isCustom: Boolean (default: false),      // Custom limit vs default
  setBy: ObjectId (ref: "User"),           // Admin who set custom limit
  reason: String,                           // Reason for custom limit
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Stage 3: Backend API Architecture

### 3.1 API Endpoints Design

**Base URL:** `/api/transfers`

#### Core Transfer Endpoints

**1. Initiate Transfer**
```
POST /api/transfers/initiate
Auth: Required
Rate Limit: 10 requests/minute

Request Body:
{
  receiverIdentifier: String,        // Email, username, or userId
  amount: Number,
  description: String (optional),
  transferPin: String (if amount > threshold)
}

Response (201):
{
  transferId: String,
  status: "initiated",
  sender: { userId, userName, userEmail },
  receiver: { userId, userName, userEmail },
  amount: Number,
  fee: Number,
  netAmount: Number,
  estimatedCompletion: Date,
  message: "Transfer initiated successfully"
}

Errors:
- 400: Invalid input, insufficient balance, invalid receiver
- 401: Unauthorized, invalid PIN
- 429: Rate limit exceeded
- 403: Transfer limit exceeded
```

**2. Process Transfer (Internal/Automated)**
```
POST /api/transfers/:transferId/process
Auth: Required (System/Admin)
Internal endpoint called by system

Functionality:
- Validates sender balance again
- Creates sender transaction (debit)
- Creates receiver transaction (credit)
- Updates both user balances
- Updates transfer status to "completed"
- Sends notifications
- All wrapped in MongoDB transaction (atomic)

Response (200):
{
  transferId: String,
  status: "completed",
  senderTransactionId: String,
  receiverTransactionId: String,
  completedAt: Date
}
```

**3. Get Transfer Details**
```
GET /api/transfers/:transferId
Auth: Required (must be sender or receiver)

Response (200):
{
  transfer: {
    _id, sender, receiver, amount, fee, netAmount,
    status, description, createdAt, completedAt,
    senderTransaction: { ...transaction details },
    receiverTransaction: { ...transaction details }
  }
}
```

**4. Get My Transfers**
```
GET /api/transfers/my-transfers
Auth: Required
Query Params:
  - type: "sent" | "received" | "all" (default: "all")
  - status: "completed" | "pending" | "failed" | "all" (default: "all")
  - page: Number (default: 1)
  - limit: Number (default: 20, max: 100)
  - startDate: ISO Date
  - endDate: ISO Date
  - sortBy: "date" | "amount" (default: "date")
  - sortOrder: "asc" | "desc" (default: "desc")

Response (200):
{
  transfers: [ ...transfer objects ],
  pagination: {
    currentPage: Number,
    totalPages: Number,
    totalTransfers: Number,
    hasMore: Boolean
  },
  summary: {
    totalSent: Number,
    totalReceived: Number,
    totalFees: Number
  }
}
```

**5. Cancel Transfer**
```
POST /api/transfers/:transferId/cancel
Auth: Required (must be sender)

Request Body:
{
  reason: String (optional)
}

Conditions:
- Can only cancel if status is "initiated" or "pending"
- Cannot cancel after processed

Response (200):
{
  message: "Transfer cancelled successfully",
  transferId: String,
  refundAmount: Number (if fee was charged)
}
```

**6. Reverse Transfer**
```
POST /api/transfers/:transferId/reverse
Auth: Required (must be sender or admin)

Request Body:
{
  reason: String (required),
  transferPin: String (required for user reversal)
}

Conditions:
- Can only reverse completed transfers
- Must be within reversal deadline (default: 24 hours)
- Creates inverse transactions
- Wrapped in atomic transaction

Response (200):
{
  message: "Transfer reversed successfully",
  transferId: String,
  reversalTransferId: String,
  newTransferStatus: "reversed"
}
```

#### User Discovery Endpoints

**7. Search Users for Transfer**
```
GET /api/transfers/search-users
Auth: Required
Query Params:
  - query: String (email, username, or name)
  - limit: Number (default: 10, max: 50)

Response (200):
{
  users: [
    {
      userId: String,
      name: String,
      email: String (partially masked: j***@example.com),
      profilePicture: String (optional),
      isVerified: Boolean
    }
  ]
}

Privacy: Returns only essential info, masks sensitive data
```

**8. Validate Receiver**
```
POST /api/transfers/validate-receiver
Auth: Required

Request Body:
{
  receiverIdentifier: String  // Email, username, or userId
}

Response (200):
{
  isValid: Boolean,
  receiver: {
    userId: String,
    name: String,
    email: String (partially masked)
  },
  canReceiveTransfers: Boolean,
  message: String
}
```

#### Transfer Limits Endpoints

**9. Get My Transfer Limits**
```
GET /api/transfers/my-limits
Auth: Required

Response (200):
{
  limits: {
    singleTransfer: Number,
    daily: Number,
    monthly: Number
  },
  currentUsage: {
    today: Number,
    thisMonth: Number
  },
  remaining: {
    today: Number,
    thisMonth: Number
  },
  resetDates: {
    daily: Date,
    monthly: Date
  }
}
```

**10. Check Transfer Feasibility**
```
POST /api/transfers/check-feasibility
Auth: Required

Request Body:
{
  receiverId: String,
  amount: Number
}

Response (200):
{
  canTransfer: Boolean,
  reasons: [
    {
      type: "balance" | "limit" | "receiver",
      message: String,
      severity: "error" | "warning"
    }
  ],
  suggestions: [String]  // Helpful suggestions
}
```

#### Admin Endpoints

**11. Get All Transfers (Admin)**
```
GET /api/admin/transfers
Auth: Required (Admin/Super Admin)
Query Params: Similar to /my-transfers with additional filters

Response: Similar to /my-transfers with all users' data
```

**12. Get Transfer Analytics (Admin)**
```
GET /api/admin/transfers/analytics
Auth: Required (Admin/Super Admin)

Response (200):
{
  summary: {
    totalTransfers: Number,
    totalVolume: Number,
    totalFees: Number,
    averageTransferAmount: Number,
    successRate: Number
  },
  trends: {
    daily: [...],
    weekly: [...],
    monthly: [...]
  },
  topUsers: [
    { userId, userName, transferCount, totalVolume }
  ],
  statusBreakdown: {
    completed: Number,
    pending: Number,
    failed: Number,
    cancelled: Number
  }
}
```

**13. Update User Transfer Limits (Admin)**
```
PUT /api/admin/transfers/limits/:userId
Auth: Required (Admin/Super Admin)

Request Body:
{
  singleTransfer: Number,
  daily: Number,
  monthly: Number,
  reason: String
}
```

#### Advanced Feature Endpoints (Post-MVP)

**14. Create Transfer Request**
```
POST /api/transfer-requests
Auth: Required

Request Body:
{
  requestFromUserId: String,
  amount: Number,
  description: String
}
```

**15. Respond to Transfer Request**
```
POST /api/transfer-requests/:requestId/respond
Auth: Required

Request Body:
{
  action: "accept" | "decline",
  transferPin: String (if accepting)
}
```

**16. Create Recurring Transfer**
```
POST /api/transfers/recurring
Auth: Required

Request Body:
{
  receiverId: String,
  amount: Number,
  frequency: "daily" | "weekly" | "biweekly" | "monthly",
  startDate: Date,
  endDate: Date (optional),
  description: String
}
```

### 3.2 Route Structure

**File:** `backend/routes/transferRoutes.js`

```javascript
// Route organization structure
const express = require('express');
const router = express.Router();

// Middleware imports
const { protect } = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { transferRateLimit } = require('../middleware/rateLimitMiddleware');

// Controller imports
const {
  initiateTransfer,
  processTransfer,
  getTransferDetails,
  getMyTransfers,
  cancelTransfer,
  reverseTransfer,
  searchUsers,
  validateReceiver,
  getMyLimits,
  checkFeasibility
} = require('../controllers/transferController');

// Core transfer routes
router.post('/initiate', protect, transferRateLimit, initiateTransfer);
router.post('/:transferId/process', protect, processTransfer);
router.get('/:transferId', protect, getTransferDetails);
router.get('/my-transfers', protect, getMyTransfers);
router.post('/:transferId/cancel', protect, cancelTransfer);
router.post('/:transferId/reverse', protect, reverseTransfer);

// User discovery routes
router.get('/search-users', protect, searchUsers);
router.post('/validate-receiver', protect, validateReceiver);

// Transfer limits routes
router.get('/my-limits', protect, getMyLimits);
router.post('/check-feasibility', protect, checkFeasibility);

module.exports = router;
```

**File:** `backend/routes/adminTransferRoutes.js`

```javascript
// Admin-specific transfer routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/requireAdmin');

const {
  getAllTransfers,
  getTransferAnalytics,
  updateUserLimits,
  flagSuspiciousTransfer
} = require('../controllers/adminTransferController');

router.get('/transfers', protect, requireAdmin, getAllTransfers);
router.get('/transfers/analytics', protect, requireAdmin, getTransferAnalytics);
router.put('/transfers/limits/:userId', protect, requireAdmin, updateUserLimits);
router.post('/transfers/:transferId/flag', protect, requireAdmin, flagSuspiciousTransfer);

module.exports = router;
```

---

## Stage 4: Business Logic Implementation

### 4.1 Transfer Service Layer

**File:** `backend/services/transferService.js`

**Purpose:** Centralize all transfer business logic, separate from controllers

**Key Functions:**

#### 4.1.1 Calculate User Balance
```javascript
/**
 * Calculate user's current balance from all transactions
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Number>} Current balance
 */
async function calculateUserBalance(userId) {
  // Logic:
  // 1. Aggregate all user's transactions
  // 2. Sum income transactions
  // 3. Sum expense transactions
  // 4. Calculate balance = income - expenses
  // 5. Cache result with short TTL (5 minutes)
  // 6. Return balance
}
```

#### 4.1.2 Validate Transfer
```javascript
/**
 * Comprehensive transfer validation
 * @param {Object} transferData - Transfer details
 * @returns {Promise<Object>} Validation result
 */
async function validateTransfer({ senderId, receiverId, amount, transferPin }) {
  // Validation checks:
  
  // 1. User validation
  //    - Sender exists and active
  //    - Receiver exists and active
  //    - Sender !== Receiver (can't transfer to self)
  //    - Receiver can accept transfers
  
  // 2. Amount validation
  //    - Amount > 0
  //    - Amount is numeric
  //    - Amount has max 2 decimal places
  //    - Amount doesn't exceed single transfer limit
  
  // 3. Balance validation
  //    - Calculate sender's current balance
  //    - Check if balance >= (amount + fee)
  //    - Provide clear error if insufficient
  
  // 4. Transfer limit validation
  //    - Check daily transfer limit
  //    - Check monthly transfer limit
  //    - Consider previous transfers today/this month
  
  // 5. PIN validation (if required)
  //    - If amount > threshold, verify PIN
  //    - Compare hashed PIN
  
  // 6. Rate limiting check
  //    - Check transfer frequency
  //    - Prevent rapid duplicate transfers
  
  // Return:
  // {
  //   isValid: Boolean,
  //   errors: [String],
  //   warnings: [String],
  //   senderBalance: Number,
  //   calculatedFee: Number
  // }
}
```

#### 4.1.3 Create Transfer Record
```javascript
/**
 * Create initial transfer record
 * @param {Object} transferDetails
 * @returns {Promise<Object>} Created transfer
 */
async function createTransferRecord({
  senderId,
  receiverId,
  amount,
  description,
  fee,
  ipAddress,
  userAgent
}) {
  // Logic:
  // 1. Fetch sender and receiver details
  // 2. Calculate net amount (amount - fee)
  // 3. Create Transfer document with status "initiated"
  // 4. Set reversalDeadline (24 hours from now)
  // 5. Save to database
  // 6. Return transfer object
}
```

#### 4.1.4 Process Transfer (Core Function)
```javascript
/**
 * Process transfer with atomic transactions
 * THIS IS THE CRITICAL FUNCTION
 * @param {ObjectId} transferId
 * @returns {Promise<Object>} Processing result
 */
async function processTransferAtomic(transferId) {
  // Use MongoDB session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Lock transfer record (update status to "processing")
    const transfer = await Transfer.findByIdAndUpdate(
      transferId,
      { status: 'processing', processedAt: new Date() },
      { new: true, session }
    );
    
    // Step 2: Validate again (balance might have changed)
    const validation = await validateTransfer(transfer);
    if (!validation.isValid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    // Step 3: Create sender's transaction (DEBIT)
    const senderTransaction = await Transaction.create([{
      user: transfer.sender.userId,
      type: 'expense',
      category: 'transfer_sent',
      amount: transfer.amount + transfer.fee,
      note: `Transfer to ${transfer.receiver.userName}: ${transfer.description}`,
      date: new Date(),
      isTransfer: true,
      transferId: transfer._id,
      transferDirection: 'sent',
      relatedUserId: transfer.receiver.userId,
      relatedUserName: transfer.receiver.userName
    }], { session });
    
    // Step 4: Create receiver's transaction (CREDIT)
    const receiverTransaction = await Transaction.create([{
      user: transfer.receiver.userId,
      type: 'income',
      category: 'transfer_received',
      amount: transfer.netAmount,
      note: `Transfer from ${transfer.sender.userName}: ${transfer.description}`,
      date: new Date(),
      isTransfer: true,
      transferId: transfer._id,
      transferDirection: 'received',
      relatedUserId: transfer.sender.userId,
      relatedUserName: transfer.sender.userName
    }], { session });
    
    // Step 5: Update transfer record with transaction IDs
    transfer.senderTransactionId = senderTransaction[0]._id;
    transfer.receiverTransactionId = receiverTransaction[0]._id;
    transfer.status = 'completed';
    transfer.completedAt = new Date();
    await transfer.save({ session });
    
    // Step 6: Update user transfer stats
    await User.findByIdAndUpdate(
      transfer.sender.userId,
      {
        $inc: {
          'transferStats.totalSent': transfer.amount,
          'transferStats.transferCount': 1
        },
        $set: { 'transferStats.lastTransferDate': new Date() }
      },
      { session }
    );
    
    await User.findByIdAndUpdate(
      transfer.receiver.userId,
      { $inc: { 'transferStats.totalReceived': transfer.netAmount } },
      { session }
    );
    
    // Step 7: Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Step 8: Send notifications (after commit, async)
    notifyTransferCompletion(transfer);
    
    return {
      success: true,
      transfer,
      senderTransaction: senderTransaction[0],
      receiverTransaction: receiverTransaction[0]
    };
    
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    
    // Update transfer status to failed
    await Transfer.findByIdAndUpdate(transferId, {
      status: 'failed',
      failureReason: error.message,
      errorCode: error.code || 'PROCESSING_ERROR'
    });
    
    // Log error for monitoring
    console.error('Transfer processing failed:', error);
    
    throw error;
  }
}
```

#### 4.1.5 Reverse Transfer
```javascript
/**
 * Reverse a completed transfer
 * @param {ObjectId} transferId
 * @param {Object} reversalDetails
 * @returns {Promise<Object>} Reversal result
 */
async function reverseTransfer(transferId, { reason, initiatedBy }) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Find original transfer
    const originalTransfer = await Transfer.findById(transferId);
    
    // Step 2: Validate reversal eligibility
    if (originalTransfer.status !== 'completed') {
      throw new Error('Can only reverse completed transfers');
    }
    if (new Date() > originalTransfer.reversalDeadline) {
      throw new Error('Reversal deadline has passed');
    }
    if (!originalTransfer.isReversible) {
      throw new Error('This transfer is not reversible');
    }
    
    // Step 3: Create reversal transfer (inverse of original)
    const reversalTransfer = await Transfer.create([{
      sender: originalTransfer.receiver,      // Swap sender/receiver
      receiver: originalTransfer.sender,
      amount: originalTransfer.netAmount,
      fee: 0,                                  // No fee for reversals
      netAmount: originalTransfer.netAmount,
      status: 'processing',
      description: `Reversal: ${reason}`,
      transferType: 'reversal',
      originalTransferId: originalTransfer._id
    }], { session });
    
    // Step 4: Create inverse transactions
    // Similar to processTransferAtomic but in reverse
    
    // Step 5: Update original transfer
    originalTransfer.status = 'reversed';
    originalTransfer.reversedAt = new Date();
    originalTransfer.reversalReason = reason;
    originalTransfer.reversalInitiatedBy = initiatedBy;
    await originalTransfer.save({ session });
    
    // Step 6: Commit
    await session.commitTransaction();
    session.endSession();
    
    // Notify both parties
    notifyTransferReversal(originalTransfer, reversalTransfer);
    
    return { success: true, reversalTransfer };
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
```

#### 4.1.6 Calculate Transfer Limits
```javascript
/**
 * Get user's remaining transfer limits
 * @param {ObjectId} userId
 * @returns {Promise<Object>} Limits and usage
 */
async function getTransferLimits(userId) {
  // Logic:
  // 1. Fetch user's limit settings
  // 2. Get today's date range
  // 3. Aggregate completed transfers today
  // 4. Get this month's date range
  // 5. Aggregate completed transfers this month
  // 6. Calculate remaining limits
  // 7. Return detailed limit object
}
```

#### 4.1.7 Detect Duplicate Transfer
```javascript
/**
 * Prevent duplicate transfers (idempotency)
 * @param {Object} transferData
 * @returns {Promise<Object|null>} Existing transfer or null
 */
async function detectDuplicateTransfer({ senderId, receiverId, amount, timestamp }) {
  // Logic:
  // Check if identical transfer exists within last 2 minutes
  // Same sender, receiver, amount
  // Prevent accidental double-submission
  
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  const existingTransfer = await Transfer.findOne({
    'sender.userId': senderId,
    'receiver.userId': receiverId,
    amount: amount,
    status: { $in: ['initiated', 'pending', 'processing', 'completed'] },
    createdAt: { $gte: twoMinutesAgo }
  });
  
  return existingTransfer;
}
```

### 4.2 Transfer Controller Implementation

**File:** `backend/controllers/transferController.js`

**Key Controllers:**

#### 4.2.1 Initiate Transfer Controller
```javascript
/**
 * POST /api/transfers/initiate
 * Initiates a new transfer
 */
const initiateTransfer = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverIdentifier, amount, description, transferPin } = req.body;
    
    // Step 1: Find receiver
    const receiver = await findUserByIdentifier(receiverIdentifier);
    if (!receiver) {
      return res.status(400).json({ 
        message: 'Receiver not found',
        error: 'RECEIVER_NOT_FOUND'
      });
    }
    
    // Step 2: Check for duplicate
    const duplicate = await detectDuplicateTransfer({
      senderId,
      receiverId: receiver._id,
      amount,
      timestamp: Date.now()
    });
    
    if (duplicate) {
      return res.status(400).json({
        message: 'Duplicate transfer detected',
        existingTransferId: duplicate._id
      });
    }
    
    // Step 3: Validate transfer
    const validation = await validateTransfer({
      senderId,
      receiverId: receiver._id,
      amount,
      transferPin
    });
    
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Transfer validation failed',
        errors: validation.errors
      });
    }
    
    // Step 4: Create transfer record
    const transfer = await createTransferRecord({
      senderId,
      receiverId: receiver._id,
      amount,
      description,
      fee: validation.calculatedFee,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Step 5: Process transfer asynchronously
    // Option A: Process immediately
    processTransferAtomic(transfer._id)
      .catch(err => console.error('Transfer processing failed:', err));
    
    // Option B: Queue for background processing (recommended for production)
    // await transferQueue.add({ transferId: transfer._id });
    
    // Step 6: Return immediate response
    res.status(201).json({
      message: 'Transfer initiated successfully',
      transferId: transfer._id,
      status: transfer.status,
      estimatedCompletion: new Date(Date.now() + 5000), // ~5 seconds
      transfer: {
        sender: transfer.sender,
        receiver: transfer.receiver,
        amount: transfer.amount,
        fee: transfer.fee,
        netAmount: transfer.netAmount
      }
    });
    
  } catch (error) {
    console.error('Initiate transfer error:', error);
    res.status(500).json({ 
      message: 'Transfer initiation failed',
      error: error.message 
    });
  }
};
```

#### 4.2.2 Get My Transfers Controller
```javascript
/**
 * GET /api/transfers/my-transfers
 * Get user's transfer history
 */
const getMyTransfers = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type = 'all',           // sent, received, all
      status = 'all',         // completed, pending, failed, all
      page = 1,
      limit = 20,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by type
    if (type === 'sent') {
      query['sender.userId'] = userId;
    } else if (type === 'received') {
      query['receiver.userId'] = userId;
    } else {
      // All transfers (sent or received)
      query.$or = [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ];
    }
    
    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Sorting
    const sortField = sortBy === 'amount' ? 'amount' : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const transfers = await Transfer.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderTransactionId receiverTransactionId')
      .lean();
    
    // Count total
    const totalTransfers = await Transfer.countDocuments(query);
    
    // Calculate summary
    const summary = await Transfer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: {
              $cond: [
                { $eq: ['$sender.userId', userId] },
                '$amount',
                0
              ]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [
                { $eq: ['$receiver.userId', userId] },
                '$netAmount',
                0
              ]
            }
          },
          totalFees: {
            $sum: {
              $cond: [
                { $eq: ['$sender.userId', userId] },
                '$fee',
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      transfers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransfers / limit),
        totalTransfers,
        hasMore: skip + transfers.length < totalTransfers
      },
      summary: summary[0] || { totalSent: 0, totalReceived: 0, totalFees: 0 }
    });
    
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: 'Failed to fetch transfers' });
  }
};
```

### 4.3 Middleware Implementation

#### 4.3.1 Transfer Rate Limiting
**File:** `backend/middleware/rateLimitMiddleware.js`

```javascript
/**
 * Rate limiting specifically for transfer operations
 * Prevents abuse and rapid duplicate transfers
 */
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');  // Optional: Use Redis for distributed systems

const transferRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,        // 1 minute window
  max: 10,                         // Max 10 transfers per minute
  message: {
    message: 'Too many transfer attempts. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,           // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user
    return req.user ? req.user._id.toString() : req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for admins
    return req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
  }
});

module.exports = { transferRateLimit };
```

#### 4.3.2 Transfer Authorization Middleware
**File:** `backend/middleware/transferAuthMiddleware.js`

```javascript
/**
 * Verify user can access specific transfer
 * User must be either sender or receiver
 */
const verifyTransferAccess = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    const userId = req.user._id;
    
    const transfer = await Transfer.findById(transferId);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    const isSender = transfer.sender.userId.toString() === userId.toString();
    const isReceiver = transfer.receiver.userId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    
    if (!isSender && !isReceiver && !isAdmin) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this transfer' 
      });
    }
    
    // Attach transfer to request for controller use
    req.transfer = transfer;
    req.userRole = isSender ? 'sender' : isReceiver ? 'receiver' : 'admin';
    
    next();
    
  } catch (error) {
    res.status(500).json({ message: 'Authorization check failed' });
  }
};

module.exports = { verifyTransferAccess };
```

---

## Stage 5: Frontend UI/UX Design

### 5.1 Component Architecture

**Component Hierarchy:**

```
Pages/
├── TransferHub.jsx                    // Main transfer page
│   ├── SendMoneyForm.jsx             // Transfer initiation form
│   ├── TransferHistory.jsx           // List of past transfers
│   └── TransferStats.jsx             // User transfer statistics
│
├── TransferDetails.jsx                // Individual transfer details page
│
└── TransferReceipt.jsx                // Transfer confirmation/receipt

Components/
├── transfer/
│   ├── UserSearchInput.jsx           // Search users for transfer
│   ├── AmountInput.jsx               // Custom amount input with validation
│   ├── TransferPreview.jsx           // Review before confirming
│   ├── TransferCard.jsx              // Single transfer display card
│   ├── TransferStatusBadge.jsx       // Status indicator
│   ├── PinInputModal.jsx             // Transfer PIN entry
│   └── TransferConfirmation.jsx      // Success/failure message
│
└── layout/
    └── TransferNav.jsx                // Transfer navigation tabs
```

### 5.2 Key Page Designs

#### 5.2.1 Transfer Hub Page Design

**File:** `frontend/src/pages/TransferHub.jsx`

**Layout Structure:**
```
┌────────────────────────────────────────────────────────┐
│  Transfer Hub                                 [Balance] │
├────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Send Money   │  │   Received   │  │   History   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Send Money Tab:                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Who do you want to send money to?              │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ 🔍 Search by email, username or name...   │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │  [User suggestions/results appear here]         │ │
│  │                                                  │ │
│  │  How much?                                       │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ $  [    Amount     ]                       │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │  Fee: $0.00  •  You send: $0.00                 │ │
│  │                                                  │ │
│  │  Add a note (optional)                          │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ What's this for?                           │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │                                                  │ │
│  │          [ Review Transfer ]                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Quick Actions:                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ Recent     │  │ Favorites  │  │ Contacts   │      │
│  └────────────┘  └────────────┘  └────────────┘      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time user search with debouncing
- Amount input with currency formatting
- Fee calculation display
- Available balance indicator
- Recent recipients for quick access
- Form validation with helpful error messages

#### 5.2.2 Transfer Preview Modal

**Design:**
```
┌──────────────────────────────────────┐
│  Review Transfer              [X]    │
├──────────────────────────────────────┤
│                                       │
│  You're sending:                     │
│                                       │
│  From:    Your Account               │
│           Current balance: $5,250.00 │
│                                       │
│  To:      John Doe                   │
│           johndoe@email.com          │
│           ┌───────────────────┐      │
│           │  Profile Picture  │      │
│           └───────────────────┘      │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Amount:        $100.00         │ │
│  │  Transfer fee:    $0.00         │ │
│  │  ─────────────────────────────  │ │
│  │  Total:         $100.00         │ │
│  │                                  │ │
│  │  Recipient gets: $100.00        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Note: "Lunch money"                 │
│                                       │
│  New balance: $5,150.00              │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Enter your transfer PIN         │ │
│  │ [  ][  ][  ][  ][  ][  ]       │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [ Cancel ]     [ Confirm Transfer ] │
│                                       │
└──────────────────────────────────────┘
```

**Functionality:**
- Clear summary of transfer details
- Visual confirmation of recipient
- PIN input for security
- Real-time balance calculations
- Cancel option
- Loading state during processing

#### 5.2.3 Transfer History Page

**Design:**
```
┌────────────────────────────────────────────────────────┐
│  Transfer History                                      │
├────────────────────────────────────────────────────────┤
│  Filters:  [All ▼] [All Status ▼] [This Month ▼]     │
│            Search: [           ]           [Export]    │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Summary:                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Sent    │  │ Received │  │   Fees   │            │
│  │ $2,450   │  │ $1,800   │  │   $0     │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ↗ Sent to Jane Smith                 Feb 18, 2026│ │
│  │   "Dinner split"                                  │ │
│  │   $45.00                          [Completed ✓]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ↙ Received from Mike Johnson        Feb 17, 2026│ │
│  │   "Movie tickets refund"                          │ │
│  │   +$25.00                         [Completed ✓]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ↗ Sent to Sarah Lee                 Feb 15, 2026│ │
│  │   "Birthday gift"                                 │ │
│  │   $100.00                         [Completed ✓]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  [Load More]                               Page 1 of 5 │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Filter by type (sent/received), status, date range
- Search functionality
- Transfer summary cards
- Status indicators
- Click to view details
- Pagination
- Export to PDF/CSV

#### 5.2.4 Transfer Receipt Page

**Design:**
```
┌──────────────────────────────────────┐
│           ✓ Transfer Successful      │
├──────────────────────────────────────┤
│                                       │
│  Transfer ID: TRF-2026-02-18-12345   │
│  Date: February 18, 2026, 3:45 PM   │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │                                  │ │
│  │   You                           │ │
│  │   ↓                             │ │
│  │   John Doe                      │ │
│  │                                  │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Amount Sent:        $100.00         │
│  Transfer Fee:         $0.00         │
│  ───────────────────────────────     │
│  Total Debited:      $100.00         │
│                                       │
│  Recipient Received:  $100.00        │
│  Note: "Lunch money"                 │
│                                       │
│  Status: Completed ✓                 │
│  Processing Time: 1.2 seconds        │
│                                       │
│  [ Download Receipt ]  [ Share ]     │
│  [ View in History ]   [ New Transfer]│
│                                       │
└──────────────────────────────────────┘
```

**Features:**
- Clear success/failure messaging
- Unique transfer ID
- Complete transaction details
- Download as PDF
- Share receipt
- Quick actions (new transfer, view history)

### 5.3 User Experience Features

#### 5.3.1 Progressive Disclosure
- Show simple form initially
- Reveal advanced options (recurring, scheduled) on demand
- Step-by-step wizard for complex transfers

#### 5.3.2 Real-time Feedback
- Instant user search results
- Live balance updates
- Fee calculations as user types
- Validation messages appear immediately

#### 5.3.3 Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode
- Focus indicators
- ARIA labels on all interactive elements

#### 5.3.4 Mobile Responsiveness
- Touch-friendly buttons (minimum 44x44px)
- Swipe gestures for navigation
- Bottom navigation for key actions
- Optimized for one-handed use

#### 5.3.5 Loading States
- Skeleton screens during data fetch
- Progress indicators for transfers
- Animated transitions
- Optimistic UI updates

#### 5.3.6 Error Handling
- Clear error messages
- Suggested solutions
- Retry options
- Graceful degradation

---

## Stage 6: Security & Validation

### 6.1 Frontend Security

#### 6.1.1 Input Validation
```javascript
// Amount validation rules
const validateAmount = (amount) => {
  const errors = [];
  
  if (!amount || amount <= 0) {
    errors.push('Amount must be greater than zero');
  }
  
  if (amount > 10000) {
    errors.push('Single transfer limit is $10,000');
  }
  
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    errors.push('Amount must have at most 2 decimal places');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Receiver validation
const validateReceiver = (receiver) => {
  if (!receiver || !receiver.userId) {
    return { isValid: false, errors: ['Please select a valid recipient'] };
  }
  
  if (receiver.userId === currentUserId) {
    return { isValid: false, errors: ['Cannot transfer money to yourself'] };
  }
  
  return { isValid: true, errors: [] };
};

// PIN validation
const validatePin = (pin) => {
  if (!pin || pin.length !== 6) {
    return { isValid: false, errors: ['PIN must be 6 digits'] };
  }
  
  if (!/^\d{6}$/.test(pin)) {
    return { isValid: false, errors: ['PIN must contain only numbers'] };
  }
  
  return { isValid: true, errors: [] };
};
```

#### 6.1.2 XSS Prevention
- Sanitize all user inputs (descriptions, notes)
- Use React's built-in XSS protection
- Escape HTML in user-generated content
- Content Security Policy headers

#### 6.1.3 CSRF Protection
- Include CSRF tokens in transfer requests
- Verify token on backend
- Use SameSite cookie attribute

### 6.2 Backend Security

#### 6.2.1 Authentication & Authorization
```javascript
// Verify user is authenticated
const protect = require('../middleware/authMiddleware').protect;

// Verify user can perform transfer
const canTransfer = async (userId) => {
  const user = await User.findById(userId);
  
  // Check if user account is active
  if (user.status === 'suspended' || user.status === 'locked') {
    throw new Error('Account is not active');
  }
  
  // Check if user has completed KYC (if required)
  if (user.kycStatus !== 'verified') {
    throw new Error('Please complete identity verification');
  }
  
  return true;
};
```

#### 6.2.2 Data Encryption
```javascript
// Encrypt sensitive transfer data
const crypto = require('crypto');

const encryptSensitiveData = (data) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt when needed
const decryptSensitiveData = (encrypted, iv, authTag) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};
```

#### 6.2.3 Transfer PIN Security
```javascript
// Hash transfer PIN (separate from password)
const bcrypt = require('bcryptjs');

const hashTransferPin = async (pin) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pin, salt);
};

// Verify PIN
const verifyTransferPin = async (userId, providedPin) => {
  const user = await User.findById(userId).select('+transferPin');
  
  if (!user.transferPin) {
    throw new Error('Transfer PIN not set');
  }
  
  const isMatch = await bcrypt.compare(providedPin, user.transferPin);
  
  if (!isMatch) {
    // Log failed attempt
    await logFailedPinAttempt(userId);
    
    // Check if too many failed attempts
    const failedAttempts = await getFailedPinAttempts(userId);
    if (failedAttempts >= 3) {
      // Lock transfers temporarily
      await lockTransfers(userId, 15); // 15 minutes
      throw new Error('Too many failed attempts. Transfers locked for 15 minutes');
    }
    
    throw new Error('Invalid PIN');
  }
  
  // Clear failed attempts on success
  await clearFailedPinAttempts(userId);
  
  return true;
};
```

#### 6.2.4 Fraud Detection
```javascript
/**
 * Detect potentially fraudulent transfers
 */
const detectFraudulentTransfer = async (transfer) => {
  const risks = [];
  
  // Check 1: Unusual amount for user
  const userAvgTransfer = await getUserAverageTransfer(transfer.sender.userId);
  if (transfer.amount > userAvgTransfer * 5) {
    risks.push({
      type: 'UNUSUAL_AMOUNT',
      severity: 'medium',
      message: 'Transfer amount significantly higher than user average'
    });
  }
  
  // Check 2: High frequency transfers
  const recentTransfers = await getRecentTransferCount(
    transfer.sender.userId,
    new Date(Date.now() - 60 * 60 * 1000) // Last hour
  );
  if (recentTransfers > 10) {
    risks.push({
      type: 'HIGH_FREQUENCY',
      severity: 'high',
      message: 'Unusually high number of transfers in short time'
    });
  }
  
  // Check 3: New recipient
  const previousTransfers = await Transfer.countDocuments({
    'sender.userId': transfer.sender.userId,
    'receiver.userId': transfer.receiver.userId,
    status: 'completed'
  });
  if (previousTransfers === 0 && transfer.amount > 500) {
    risks.push({
      type: 'NEW_RECIPIENT',
      severity: 'low',
      message: 'First time transfer to this recipient with high amount'
    });
  }
  
  // Check 4: Cross-check with known fraud patterns
  // (Could integrate with fraud detection API)
  
  // Calculate overall risk score
  const riskScore = risks.reduce((score, risk) => {
    const severityScores = { low: 1, medium: 3, high: 5 };
    return score + severityScores[risk.severity];
  }, 0);
  
  return {
    isSuspicious: riskScore >= 5,
    riskScore,
    risks,
    action: riskScore >= 8 ? 'block' : riskScore >= 5 ? 'review' : 'allow'
  };
};

// Use in transfer processing
const processTransferWithFraudCheck = async (transferId) => {
  const transfer = await Transfer.findById(transferId);
  
  // Run fraud detection
  const fraudCheck = await detectFraudulentTransfer(transfer);
  
  if (fraudCheck.action === 'block') {
    // Block transfer
    transfer.status = 'failed';
    transfer.failureReason = 'Transfer blocked due to suspicious activity';
    await transfer.save();
    
    // Alert admin
    await alertAdmin('SUSPICIOUS_TRANSFER', { transferId, risks: fraudCheck.risks });
    
    throw new Error('Transfer blocked for security reasons');
  }
  
  if (fraudCheck.action === 'review') {
    // Put in manual review queue
    transfer.status = 'pending_review';
    transfer.reviewRequired = true;
    transfer.reviewReason = fraudCheck.risks.map(r => r.message).join('; ');
    await transfer.save();
    
    // Notify admin
    await notifyAdminForReview(transfer);
    
    return { status: 'pending_review', message: 'Transfer under review' };
  }
  
  // Proceed with normal processing
  return await processTransferAtomic(transferId);
};
```

#### 6.2.5 Rate Limiting & Throttling
```javascript
// Additional custom rate limiting logic
const checkTransferRateLimit = async (userId) => {
  const key = `transfer_rate_${userId}`;
  const limit = 10; // 10 transfers per minute
  const window = 60; // 60 seconds
  
  // Using Redis (recommended) or in-memory cache
  const currentCount = await redis.get(key) || 0;
  
  if (currentCount >= limit) {
    throw new Error('Transfer rate limit exceeded. Please wait before trying again.');
  }
  
  // Increment counter
  await redis.incr(key);
  await redis.expire(key, window);
  
  return true;
};

// Implement progressive delays for rapid transfers
const implementProgressiveDelay = async (userId) => {
  const recentCount = await getRecentTransferCount(userId, 5 * 60 * 1000); // Last 5 minutes
  
  if (recentCount > 5) {
    const delaySeconds = Math.min((recentCount - 5) * 2, 30); // Max 30 seconds
    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
  }
};
```

### 6.3 Database Security

#### 6.3.1 Transaction Atomicity
```javascript
// Ensure all operations succeed or all fail
const mongoose = require('mongoose');

// Always use sessions for critical operations
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Perform all operations with session
  await operation1({ session });
  await operation2({ session });
  await operation3({ session });
  
  // Commit if all succeed
  await session.commitTransaction();
} catch (error) {
  // Rollback if any fails
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

#### 6.3.2 Data Access Control
```javascript
// Prevent direct access to sensitive fields
const userSchema = new mongoose.Schema({
  transferPin: {
    type: String,
    select: false  // Exclude by default
  }
});

// Explicitly include when needed
const user = await User.findById(userId).select('+transferPin');
```

---

## Stage 7: Notification System

### 7.1 Notification Types

**Transfer Notifications:**

1. **Transfer Initiated** (Sender)
   - "Your transfer of $100 to John Doe is being processed"

2. **Transfer Completed** (Sender & Receiver)
   - Sender: "Transfer successful! $100 sent to John Doe"
   - Receiver: "You received $100 from Jane Smith"

3. **Transfer Failed** (Sender)
   - "Transfer failed: Insufficient balance"

4. **Transfer Cancelled** (Sender & Receiver)
   - "Transfer cancelled as requested"

5. **Transfer Received** (Receiver)
   - "John Doe sent you $50 with note: 'Coffee money'"

6. **Transfer Reversed** (Sender & Receiver)
   - "Transfer has been reversed: [reason]"

7. **Transfer Pending Review** (Sender)
   - "Your transfer is under security review. We'll update you soon."

### 7.2 Notification Channels

#### 7.2.1 In-App Notifications
**Implementation:**
```javascript
// Notification model already exists
// Enhance for transfer notifications

const createTransferNotification = async ({
  userId,
  transferId,
  type,
  title,
  message
}) => {
  await Notification.create({
    user: userId,
    type,
    title,
    message,
    data: {
      transferId,
      actionUrl: `/transfers/${transferId}`
    },
    priority: 'high'
  });
  
  // Emit real-time notification via WebSocket (if implemented)
  io.to(userId).emit('notification', {
    type,
    title,
    message,
    transferId
  });
};
```

#### 7.2.2 Email Notifications
**Implementation:**
```javascript
const sendTransferEmail = async ({
  to,
  userName,
  transferDetails,
  type
}) => {
  const templates = {
    TRANSFER_COMPLETED_SENDER: {
      subject: 'Transfer Successful',
      html: `
        <h2>Transfer Completed</h2>
        <p>Hi ${userName},</p>
        <p>Your transfer of $${transferDetails.amount} to ${transferDetails.receiverName} was successful.</p>
        <p><strong>Transfer ID:</strong> ${transferDetails.transferId}</p>
        <p><strong>Date:</strong> ${transferDetails.date}</p>
        <p><a href="${process.env.APP_URL}/transfers/${transferDetails.transferId}">View Transfer Details</a></p>
      `
    },
    TRANSFER_RECEIVED: {
      subject: 'Money Received',
      html: `
        <h2>You Received Money!</h2>
        <p>Hi ${userName},</p>
        <p>${transferDetails.senderName} sent you $${transferDetails.amount}</p>
        <p><strong>Note:</strong> ${transferDetails.description}</p>
        <p><a href="${process.env.APP_URL}/dashboard">View Your Balance</a></p>
      `
    }
  };
  
  const template = templates[type];
  
  await sendEmail({
    to,
    subject: template.subject,
    html: template.html
  });
};
```

#### 7.2.3 SMS Notifications (Optional)
**Integration with Twilio:**
```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendTransferSMS = async ({ to, message }) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
};

// Example usage
await sendTransferSMS({
  to: '+1234567890',
  message: 'You received $100 from Jane Smith. Check your Smart Financial Manager account.'
});
```

### 7.3 Notification Preferences

**Allow users to control notifications:**

```javascript
// Add to User model
notificationPreferences: {
  transfer: {
    inApp: Boolean (default: true),
    email: Boolean (default: true),
    sms: Boolean (default: false),
    onlyAboveAmount: Number (default: 0)  // Only notify for transfers above this amount
  }
}

// Check preferences before sending
const sendNotification = async (userId, notification) => {
  const user = await User.findById(userId);
  const prefs = user.notificationPreferences.transfer;
  
  // Check amount threshold
  if (notification.amount < prefs.onlyAboveAmount) {
    return; // Skip notification
  }
  
  if (prefs.inApp) {
    await createInAppNotification(notification);
  }
  
  if (prefs.email) {
    await sendTransferEmail(notification);
  }
  
  if (prefs.sms && user.phoneNumber) {
    await sendTransferSMS(notification);
  }
};
```

---

## Stage 8: Testing Strategy

### 8.1 Unit Tests

#### 8.1.1 Service Function Tests
```javascript
// Test: Calculate user balance
describe('calculateUserBalance', () => {
  it('should correctly calculate balance from transactions', async () => {
    const userId = 'test-user-id';
    // Mock transactions
    const balance = await calculateUserBalance(userId);
    expect(balance).toBe(5000);
  });
  
  it('should return 0 for users with no transactions', async () => {
    const userId = 'new-user-id';
    const balance = await calculateUserBalance(userId);
    expect(balance).toBe(0);
  });
});

// Test: Transfer validation
describe('validateTransfer', () => {
  it('should reject transfer with insufficient balance', async () => {
    const result = await validateTransfer({
      senderId: 'user1',
      receiverId: 'user2',
      amount: 10000 // User only has 5000
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Insufficient balance');
  });
  
  it('should reject transfer to self', async () => {
    const result = await validateTransfer({
      senderId: 'user1',
      receiverId: 'user1',
      amount: 100
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Cannot transfer to yourself');
  });
  
  it('should validate correct transfer', async () => {
    const result = await validateTransfer({
      senderId: 'user1',
      receiverId: 'user2',
      amount: 100
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

#### 8.1.2 Controller Tests
```javascript
// Test: Initiate transfer endpoint
describe('POST /api/transfers/initiate', () => {
  it('should create transfer with valid data', async () => {
    const response = await request(app)
      .post('/api/transfers/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        receiverIdentifier: 'receiver@example.com',
        amount: 100,
        description: 'Test transfer'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.transferId).toBeDefined();
    expect(response.body.status).toBe('initiated');
  });
  
  it('should reject transfer without authentication', async () => {
    const response = await request(app)
      .post('/api/transfers/initiate')
      .send({ amount: 100 });
    
    expect(response.status).toBe(401);
  });
  
  it('should reject transfer with invalid amount', async () => {
    const response = await request(app)
      .post('/api/transfers/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        receiverIdentifier: 'receiver@example.com',
        amount: -50
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid amount');
  });
});
```

### 8.2 Integration Tests

#### 8.2.1 Complete Transfer Flow Test
```javascript
describe('Complete Transfer Flow', () => {
  it('should complete full transfer from initiation to completion', async () => {
    // Setup: Create two test users with balances
    const sender = await createTestUser({ balance: 1000 });
    const receiver = await createTestUser({ balance: 500 });
    
    // Step 1: Initiate transfer
    const initiateResponse = await request(app)
      .post('/api/transfers/initiate')
      .set('Authorization', `Bearer ${sender.token}`)
      .send({
        receiverIdentifier: receiver.email,
        amount: 200,
        description: 'Test transfer'
      });
    
    expect(initiateResponse.status).toBe(201);
    const transferId = initiateResponse.body.transferId;
    
    // Step 2: Wait for processing (or manually trigger)
    await processTransferAtomic(transferId);
    
    // Step 3: Verify transfer completed
    const transfer = await Transfer.findById(transferId);
    expect(transfer.status).toBe('completed');
    
    // Step 4: Verify transactions created
    expect(transfer.senderTransactionId).toBeDefined();
    expect(transfer.receiverTransactionId).toBeDefined();
    
    // Step 5: Verify balances updated
    const senderBalance = await calculateUserBalance(sender._id);
    const receiverBalance = await calculateUserBalance(receiver._id);
    
    expect(senderBalance).toBe(800); // 1000 - 200
    expect(receiverBalance).toBe(700); // 500 + 200
    
    // Step 6: Verify notifications sent
    const senderNotifications = await Notification.find({ user: sender._id });
    const receiverNotifications = await Notification.find({ user: receiver._id });
    
    expect(senderNotifications.length).toBeGreaterThan(0);
    expect(receiverNotifications.length).toBeGreaterThan(0);
  });
});
```

#### 8.2.2 Atomicity Test
```javascript
describe('Transfer Atomicity', () => {
  it('should rollback if receiver transaction fails', async () => {
    const sender = await createTestUser({ balance: 1000 });
    const receiver = await createTestUser({ balance: 500 });
    
    // Mock receiver transaction creation to fail
    jest.spyOn(Transaction, 'create').mockImplementationOnce(() => {
      throw new Error('Transaction creation failed');
    });
    
    const transferId = await createTransferRecord({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: 200
    });
    
    // Attempt to process (should fail)
    await expect(processTransferAtomic(transferId)).rejects.toThrow();
    
    // Verify no transactions were created
    const senderTransactions = await Transaction.find({ user: sender._id, isTransfer: true });
    const receiverTransactions = await Transaction.find({ user: receiver._id, isTransfer: true });
    
    expect(senderTransactions.length).toBe(0);
    expect(receiverTransactions.length).toBe(0);
    
    // Verify balances unchanged
    const senderBalance = await calculateUserBalance(sender._id);
    const receiverBalance = await calculateUserBalance(receiver._id);
    
    expect(senderBalance).toBe(1000);
    expect(receiverBalance).toBe(500);
    
    // Verify transfer marked as failed
    const transfer = await Transfer.findById(transferId);
    expect(transfer.status).toBe('failed');
  });
});
```

### 8.3 End-to-End Tests

#### 8.3.1 UI Interaction Tests (Playwright/Cypress)
```javascript
// Test: Complete transfer via UI
describe('Transfer via UI', () => {
  it('should allow user to send money through UI', async () => {
    // Login as sender
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'sender@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to transfer page
    await page.click('text=Send Money');
    
    // Search for receiver
    await page.fill('[placeholder="Search by email"]', 'receiver@example.com');
    await page.click('text=John Doe'); // Select from results
    
    // Enter amount
    await page.fill('[name="amount"]', '100');
    
    // Add note
    await page.fill('[name="description"]', 'Test transfer');
    
    // Click review
    await page.click('text=Review Transfer');
    
    // Enter PIN
    await page.fill('[name="transferPin"]', '123456');
    
    // Confirm transfer
    await page.click('text=Confirm Transfer');
    
    // Wait for success message
    await page.waitForSelector('text=Transfer Successful');
    
    // Verify success page displayed
    const successText = await page.textContent('h2');
    expect(successText).toContain('Transfer Successful');
    
    // Verify transfer appears in history
    await page.click('text=View in History');
    await page.waitForSelector('text=John Doe');
  });
});
```

### 8.4 Performance Tests

#### 8.4.1 Load Testing
```javascript
// Using Artillery or k6
// Test concurrent transfers

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const url = 'http://localhost:5000/api/transfers/initiate';
  const payload = JSON.stringify({
    receiverIdentifier: 'receiver@example.com',
    amount: 100,
    description: 'Load test transfer'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.USER_TOKEN}`
    },
  };
  
  const response = http.post(url, payload, params);
  
  check(response, {
    'status is 201': (r) => r.status === 201,
    'transfer initiated': (r) => JSON.parse(r.body).transferId !== undefined,
    'response time < 2s': (r) => r.timings.duration < 2000
  });
  
  sleep(1);
}

// Run: k6 run transfer-load-test.js
```

### 8.5 Security Tests

#### 8.5.1 Authorization Tests
```javascript
describe('Transfer Authorization', () => {
  it('should not allow viewing other users transfers', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    
    // User1 creates a transfer
    const transfer = await createTransferRecord({
      senderId: user1._id,
      receiverId: user2._id,
      amount: 100
    });
    
    // User3 tries to view transfer (should fail)
    const user3 = await createTestUser();
    const response = await request(app)
      .get(`/api/transfers/${transfer._id}`)
      .set('Authorization', `Bearer ${user3.token}`);
    
    expect(response.status).toBe(403);
  });
  
  it('should not allow cancelling others transfers', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    
    const transfer = await createTransferRecord({
      senderId: user1._id,
      receiverId: user2._id,
      amount: 100
    });
    
    // User3 tries to cancel (should fail)
    const response = await request(app)
      .post(`/api/transfers/${transfer._id}/cancel`)
      .set('Authorization', `Bearer ${user3.token}`);
    
    expect(response.status).toBe(403);
  });
});
```

---

## Stage 9: Deployment & Monitoring

### 9.1 Environment Configuration

**Environment Variables for Transfer Feature:**

```env
# Transfer Settings
TRANSFER_SINGLE_LIMIT=10000
TRANSFER_DAILY_LIMIT=50000
TRANSFER_MONTHLY_LIMIT=200000
TRANSFER_FEE_PERCENTAGE=0.01         # 1% fee (if applicable)
TRANSFER_PIN_REQUIRED_ABOVE=1000
TRANSFER_REVERSAL_WINDOW_HOURS=24

# Notification Settings
ENABLE_TRANSFER_EMAIL_NOTIFICATIONS=true
ENABLE_TRANSFER_SMS_NOTIFICATIONS=false
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
ENCRYPTION_KEY=your_32_byte_hex_key
FRAUD_DETECTION_ENABLED=true
FRAUD_DETECTION_AUTO_BLOCK=true

# Performance
TRANSFER_PROCESSING_TIMEOUT=30000    # 30 seconds
REDIS_URL=redis://localhost:6379     # For caching and rate limiting
```

### 9.2 Database Indexes

**Create indexes for optimal performance:**

```javascript
// Run in MongoDB shell or through migration script

db.transfers.createIndex({ "sender.userId": 1, "createdAt": -1 });
db.transfers.createIndex({ "receiver.userId": 1, "createdAt": -1 });
db.transfers.createIndex({ "status": 1, "createdAt": -1 });
db.transfers.createIndex({ "createdAt": -1 });
db.transfers.createIndex({ 
  "sender.userId": 1, 
  "status": 1, 
  "createdAt": -1 
});

// Text index for search
db.transfers.createIndex({
  "description": "text",
  "sender.userName": "text",
  "receiver.userName": "text"
});

// Compound index for analytics
db.transfers.createIndex({
  "status": 1,
  "completedAt": -1
});
```

### 9.3 Monitoring & Alerts

#### 9.3.1 Metrics to Track
```javascript
// Key Performance Indicators (KPIs)
const transferMetrics = {
  // Volume metrics
  totalTransfers: 'Count of all transfers',
  totalVolume: 'Total amount transferred',
  averageTransferAmount: 'Average transfer amount',
  
  // Success metrics
  successRate: '% of successful transfers',
  failureRate: '% of failed transfers',
  averageProcessingTime: 'Average time to process transfer',
  
  // User metrics
  activeTransferUsers: 'Users who made transfers',
  newTransferUsers: 'First-time transfer users',
  repeatTransferRate: '% of users making multiple transfers',
  
  // Security metrics
  suspiciousTransfers: 'Transfers flagged for review',
  blockedTransfers: 'Transfers blocked by security',
  reversalRate: '% of transfers reversed',
  
  // Performance metrics
  apiResponseTime: 'Average API response time',
  databaseQueryTime: 'Average database query time',
  peakConcurrentTransfers: 'Max concurrent transfers'
};
```

#### 9.3.2 Alert Configuration
```javascript
// Configure alerts for critical issues

const alerts = [
  {
    metric: 'successRate',
    condition: '< 95%',
    severity: 'high',
    action: 'Alert dev team immediately'
  },
  {
    metric: 'averageProcessingTime',
    condition: '> 5 seconds',
    severity: 'medium',
    action: 'Investigate performance issues'
  },
  {
    metric: 'suspiciousTransfers',
    condition: '> 10 per hour',
    severity: 'high',
    action: 'Alert security team'
  },
  {
    metric: 'apiResponseTime',
    condition: '> 2 seconds',
    severity: 'medium',
    action: 'Check server load and optimize'
  }
];
```

#### 9.3.3 Logging Strategy
```javascript
// Comprehensive logging for transfers

const logger = require('winston');

// Log all transfer events
const logTransferEvent = (event, data) => {
  logger.info({
    event,
    timestamp: new Date().toISOString(),
    transferId: data.transferId,
    senderId: data.senderId,
    receiverId: data.receiverId,
    amount: data.amount,
    status: data.status,
    processingTime: data.processingTime,
    ipAddress: data.ipAddress
  });
};

// Usage examples
logTransferEvent('TRANSFER_INITIATED', { ... });
logTransferEvent('TRANSFER_VALIDATED', { ... });
logTransferEvent('TRANSFER_PROCESSING', { ... });
logTransferEvent('TRANSFER_COMPLETED', { ... });
logTransferEvent('TRANSFER_FAILED', { ... });

// Log errors with full context
logger.error({
  event: 'TRANSFER_ERROR',
  error: error.message,
  stack: error.stack,
  transferId,
  context: { ...transferData }
});
```

### 9.4 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] API documentation generated
- [ ] Rollback plan prepared

**Deployment:**
- [ ] Create database backup
- [ ] Deploy backend changes
- [ ] Run database migrations
- [ ] Create required indexes
- [ ] Deploy frontend changes
- [ ] Run smoke tests
- [ ] Monitor for errors
- [ ] Check metrics dashboard

**Post-Deployment:**
- [ ] Verify all endpoints working
- [ ] Check error rate
- [ ] Monitor performance metrics
- [ ] Test transfer flow end-to-end
- [ ] Verify notifications working
- [ ] Update status page
- [ ] Announce feature to users

### 9.5 Rollback Procedure

**If issues are detected:**

1. **Immediate Actions:**
   - Stop new transfers (feature flag)
   - Alert team
   - Assess impact

2. **Rollback Steps:**
   ```bash
   # Rollback backend
   git revert <commit-hash>
   npm run deploy:backend
   
   # Rollback frontend
   git revert <commit-hash>
   npm run deploy:frontend
   
   # Rollback database migration (if needed)
   npm run migrate:rollback
   ```

3. **Data Integrity Check:**
   - Verify no partial transfers
   - Check balance consistency
   - Audit transaction records

4. **Communication:**
   - Notify affected users
   - Update status page
   - Post-mortem analysis

---

## Implementation Timeline

### Week 1-2: Foundation
- Database schema design
- Backend API structure
- Core service layer functions
- Basic validation logic

### Week 3-4: Core Development
- Implement transfer processing
- Transaction atomicity
- Frontend UI components
- User search functionality

### Week 5-6: Advanced Features
- Transfer limits
- Pin security
- Fraud detection
- Notification system

### Week 7-8: Testing & Polish
- Unit tests
- Integration tests
- E2E tests
- UI/UX refinement

### Week 9: Deployment
- Security audit
- Performance optimization
- Staging deployment
- Production deployment

### Week 10: Monitoring & Iteration
- Monitor metrics
- Gather user feedback
- Fix issues
- Plan enhancements

---

## Success Criteria

**Feature is successful when:**

1. ✅ Users can send money to other users within 30 seconds
2. ✅ 99%+ transfer success rate
3. ✅ Zero partial transfers (atomicity maintained)
4. ✅ All security validations working correctly
5. ✅ Notifications delivered within 5 seconds
6. ✅ No unauthorized access to transfers
7. ✅ Comprehensive audit trail maintained
8. ✅ Performance metrics meet targets
9. ✅ Positive user feedback
10. ✅ Admin monitoring dashboard functional

---

## Future Enhancements

**Post-MVP Features:**

1. **International Transfers**
   - Multi-currency support
   - Exchange rate integration
   - International fees

2. **Scheduled Transfers**
   - Set future transfer date
   - Recurring transfers
   - Transfer automation

3. **Group Transfers**
   - Split bills among multiple users
   - Group expense management
   - Contribution tracking

4. **QR Code Transfers**
   - Generate QR code for receiving
   - Scan QR to send money
   - Quick payment links

5. **Transfer Templates**
   - Save frequent recipients
   - Template management
   - Quick transfer

6. **Enhanced Security**
   - Biometric authentication
   - Two-factor authentication
   - Device recognition

7. **Advanced Analytics**
   - Transfer patterns analysis
   - Spending insights
   - Cash flow predictions

8. **Social Features**
   - Transfer comments/messages
   - Social feed of transfers
   - Transfer reactions

---

## Conclusion

This P2P money transfer feature transforms your Smart Financial Manager from a personal finance tracker into a comprehensive financial platform. Unlike basic CRUD operations, this implementation includes:

- **Real Financial Logic**: Balance validation, limits, fees
- **Data Integrity**: Atomic transactions, rollback capability
- **Security**: Multi-layer validation, fraud detection, encryption
- **User Experience**: Intuitive UI, real-time feedback, notifications
- **Scalability**: Rate limiting, caching, performance optimization
- **Monitoring**: Comprehensive logging, metrics, alerts

By following this stage-by-stage guide, you'll implement a production-ready feature that demonstrates advanced full-stack development skills, perfect for a final year computer science project.

---

**Next Steps:**
1. Review this document thoroughly
2. Set up development environment
3. Create feature branch in Git
4. Begin Stage 1: Database Schema implementation
5. Test each stage before moving to next
6. Document challenges and solutions
7. Prepare demo for presentation

**Good luck with your implementation!** 🚀
