# 🧪 Wallet System Testing Guide

## Quick Start Testing

### Option 1: Automated Test Script (Recommended)

**Run the comprehensive test:**

```bash
cd backend
node test/test-wallet-system.js
```

**What it tests:**
- ✅ User authentication
- ✅ Wallet initialization
- ✅ Add funds ($1000 to User 1, $500 to User 2)
- ✅ P2P transfer ($100 from User 1 to User 2)
- ✅ Balance verification
- ✅ Withdraw funds ($50 from User 1)
- ✅ Overdraft protection
- ✅ Transaction history

**Expected output:**
```
🧪 WALLET SYSTEM COMPREHENSIVE TEST
━━━ TEST 1: User Authentication ━━━
✅ Logged in as Wallet Tester 1
✅ Logged in as Wallet Tester 2

━━━ TEST 2: Get Initial Wallet Balances ━━━
   User 1 Initial Balance: $0
   User 2 Initial Balance: $0

━━━ TEST 3: Add Funds to User 1 ━━━
✅ Added $1000 successfully
   Previous Balance: $0
   New Balance: $1000

━━━ TEST 4: Add Funds to User 2 ━━━
✅ Added $500 successfully
   Previous Balance: $0
   New Balance: $500

━━━ TEST 5: P2P Transfer (User 1 → User 2) ━━━
✅ Transfer completed
   Transfer ID: 65f1234567890...
   
━━━ TEST 6: Verify Balances After Transfer ━━━
   User 1 Balance After Transfer: $900
   User 2 Balance After Transfer: $600
✅ ✓ User 1 balance correct (deducted $100)
✅ ✓ User 2 balance correct (received $100)

🎉 WALLET SYSTEM IS FULLY FUNCTIONAL!
```

---

## Option 2: Manual Testing via UI

### Step 1: Start Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Step 2: Initialize Wallets (if needed)

```bash
cd backend
node test/initialize-wallets.js
```

### Step 3: Test Each Feature

#### A. **Test Wallet Page**

1. Login to your account
2. Navigate to **Tools → Wallet** (in sidebar)
3. ✅ Verify you see:
   - Balance display (should show current balance)
   - Show/hide balance toggle (eye icon)
   - "Add Funds" button
   - "Withdraw" button
   - Recent transactions section

#### B. **Test Add Funds**

1. Click "Add Funds" button
2. Modal opens
3. Enter amount: `100`
4. Select payment method: `Debit/Credit Card`
5. Enter card details:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVV: `123`
6. Click "Add Funds"
7. ✅ Verify:
   - Success message appears
   - Balance increases by $100
   - Transaction appears in history
   - Modal closes

#### C. **Test P2P Transfer**

1. Go to **Tools → Transfers**
2. ✅ Verify: Balance shows at top (from wallet)
3. Click "Send Money" tab
4. Search for another user
5. Enter amount: `50`
6. Add description: `Test transfer`
7. Click "Review Transfer"
8. Click "Confirm"
9. ✅ Verify:
   - Success message
   - Your balance decreased by $50
   - Recipient's balance increased by $50

#### D. **Test Withdraw**

1. Go back to **Tools → Wallet**
2. Click "Withdraw" button
3. Modal opens
4. Enter amount: `25`
5. Optionally enter bank account
6. Click "Withdraw"
7. ✅ Verify:
   - Success message
   - Balance decreases by $25
   - Transaction appears in history

#### E. **Test Insufficient Balance**

1. Try to send transfer larger than your balance
2. ✅ Verify: Get "Insufficient balance" error
3. Try to withdraw more than your balance
4. ✅ Verify: Get "Insufficient balance" error

---

## Option 3: API Testing (Postman/Thunder Client)

### Prerequisites
- Backend running on `http://localhost:5000`
- Get auth token by logging in first

### Test Sequence

#### 1. Login
```
POST http://localhost:5000/api/users/login
Body (JSON):
{
  "email": "your@email.com",
  "password": "yourpassword"
}

Copy the "token" from response
```

#### 2. Get Wallet Balance
```
GET http://localhost:5000/api/wallet/balance
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected Response:
{
  "success": true,
  "wallet": {
    "balance": 0,
    "availableBalance": 0,
    "pendingBalance": 0,
    "currency": "USD",
    "status": "active"
  }
}
```

#### 3. Add Funds
```
POST http://localhost:5000/api/wallet/add-funds
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "amount": 1000,
  "paymentMethod": "card",
  "cardLast4": "4242"
}

Expected Response:
{
  "success": true,
  "message": "Funds added successfully",
  "wallet": {
    "balance": 1000,
    "previousBalance": 0,
    "amountAdded": 1000
  }
}
```

#### 4. Verify Balance Updated
```
GET http://localhost:5000/api/wallet/balance
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected: balance should be 1000
```

#### 5. Withdraw Funds
```
POST http://localhost:5000/api/wallet/withdraw
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "amount": 100,
  "bankAccount": "Test Bank ****1234"
}

Expected Response:
{
  "success": true,
  "message": "Withdrawal successful",
  "wallet": {
    "balance": 900,
    "previousBalance": 1000,
    "amountWithdrawn": 100
  }
}
```

#### 6. Get Transaction History
```
GET http://localhost:5000/api/wallet/transactions?limit=10
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE

Expected Response:
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "income",
      "category": "wallet_deposit",
      "amount": 1000,
      "date": "2026-03-01T...",
      ...
    },
    {
      "_id": "...",
      "type": "expense", 
      "category": "wallet_withdrawal",
      "amount": 100,
      "date": "2026-03-01T...",
      ...
    }
  ]
}
```

#### 7. Test Transfer
```
POST http://localhost:5000/api/transfers/initiate
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "receiverIdentifier": "recipient@email.com",
  "amount": 50,
  "description": "Test transfer"
}

Expected Response:
{
  "transferId": "...",
  "status": "completed",
  "amount": 50,
  "message": "Transfer completed successfully"
}
```

#### 8. Verify Both Balances
```
# Check sender balance (should be 850)
GET http://localhost:5000/api/wallet/balance

# Login as recipient and check (should have +50)
```

---

## Verification Checklist

### ✅ Wallet Functionality
- [ ] Wallet initializes with $0 for new users
- [ ] Add funds increases balance
- [ ] Withdraw decreases balance
- [ ] Balance displays correctly
- [ ] Transaction history shows all operations

### ✅ Transfer Integration
- [ ] Transfer deducts from sender's wallet
- [ ] Transfer adds to receiver's wallet
- [ ] Cannot transfer more than wallet balance
- [ ] Transfer shown in wallet transactions

### ✅ Security
- [ ] Cannot add negative amounts
- [ ] Cannot withdraw more than balance
- [ ] Cannot transfer more than balance
- [ ] Requires authentication for all operations
- [ ] Atomic transactions (both wallets update or neither)

### ✅ UI/UX
- [ ] Balance displayed prominently
- [ ] Show/hide balance works
- [ ] Add funds modal works
- [ ] Withdraw modal works
- [ ] Success/error messages show
- [ ] Transaction history displays

### ✅ Edge Cases
- [ ] Adding $0 shows error
- [ ] Adding > $10,000 shows error
- [ ] Withdrawing from empty wallet shows error
- [ ] Transfer to non-existent user shows error
- [ ] Page refresh preserves balance

---

## Troubleshooting

### Issue: "Wallet not found"
**Solution:**
```bash
cd backend
node test/initialize-wallets.js
```

### Issue: Balance shows $0 but I added funds
**Check:**
1. Look at browser console for errors
2. Check backend logs for errors
3. Verify database connection
4. Run: `GET /api/wallet/balance` to see actual balance

### Issue: Transfer fails
**Check:**
1. Sender has sufficient wallet balance
2. Receiver exists in system
3. Both users have wallets initialized

### Issue: Test script fails
**Check:**
1. Backend server is running on port 5000
2. MongoDB is connected
3. Install dependencies: `npm install axios chalk`

---

## Quick Verification Commands

### Check if wallet exists in database
```javascript
// In MongoDB Compass or Shell
db.wallets.find({ user: ObjectId("USER_ID_HERE") })
```

### Check wallet transactions
```javascript
db.transactions.find({ 
  category: { $in: ["wallet_deposit", "wallet_withdrawal"] } 
}).sort({ date: -1 })
```

### Check ledger entries
```javascript
db.ledgerentries.find({}).sort({ timestamp: -1 }).limit(10)
```

---

## Success Criteria

Your wallet system is working correctly if:

✅ Users can add funds and see balance increase  
✅ Users can withdraw funds and see balance decrease  
✅ P2P transfers deduct from sender and add to receiver  
✅ Overdraft is prevented (cannot withdraw/transfer more than balance)  
✅ Transaction history shows all wallet operations  
✅ Balance persists across page refreshes  
✅ Multiple simultaneous operations don't cause inconsistencies  

---

## Performance Benchmarks

**Expected performance:**
- Get balance: < 100ms
- Add funds: < 2 seconds
- Withdraw: < 2 seconds
- Transfer: < 2 seconds
- Transaction history: < 500ms

If your tests show these results, your wallet system is **production-ready**! 🚀
