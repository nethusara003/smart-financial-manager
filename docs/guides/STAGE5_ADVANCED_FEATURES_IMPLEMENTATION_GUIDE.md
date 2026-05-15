# Stage 5: Advanced Features Implementation Guide

**Project:** Smart Financial Tracker - Advanced Financial Modules  
**Version:** 1.0  
**Date:** February 18, 2026  
**Status:** Planning Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Feature 1: Loan & EMI Calculator](#feature-1-loan--emi-calculator)
3. [Feature 2: Net Worth Tracking](#feature-2-net-worth-tracking)
4. [Feature 3: Tax Planning Module](#feature-3-tax-planning-module)
5. [Feature 4: Receipt OCR & Management](#feature-4-receipt-ocr--management)
6. [Feature 5: Advanced Analytics Dashboard](#feature-5-advanced-analytics-dashboard)
7. [Implementation Timeline](#implementation-timeline)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

---

## Overview

This document provides a comprehensive, stage-by-stage implementation plan for five high-priority advanced features that will transform the Smart Financial Tracker into a research-grade, production-ready financial management system.

### Research Contributions
- **Financial Planning Innovation**: Advanced loan calculations with predictive analytics
- **Holistic Wealth Management**: Complete net worth tracking system
- **Tax Optimization**: Intelligent tax planning and compliance assistance
- **AI/ML Integration**: OCR technology for automated receipt processing
- **Data Science**: Advanced analytics with predictive modeling

### Implementation Approach
Each feature is broken down into manageable stages:
- **Stage A**: Database Schema & Models
- **Stage B**: Backend API Development
- **Stage C**: Services & Business Logic
- **Stage D**: Frontend Components
- **Stage E**: Integration & Testing
- **Stage F**: Polish & Optimization

---

## Feature 1: Loan & EMI Calculator

### Overview
A comprehensive loan management system with EMI calculations, amortization schedules, and early payoff analysis.

### Stage 1A: Database Schema Design

#### Models to Create

**1. Loan Model** (`backend/models/Loan.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- loanName: String (e.g., "Home Loan", "Car Loan")
- loanType: String (enum: ["home", "car", "personal", "education", "business", "other"])
- principalAmount: Number (required, min: 0)
- interestRate: Number (required, annual rate, min: 0, max: 100)
- tenure: Number (required, in months)
- startDate: Date (required)
- endDate: Date (calculated)
- emiAmount: Number (calculated)
- totalInterest: Number (calculated)
- totalPayment: Number (calculated)
- status: String (enum: ["active", "paid", "closed", "defaulted"], default: "active")
- lender: String (bank/institution name)
- accountNumber: String (optional)
- notes: String (optional)
- remainingBalance: Number (calculated, updated with payments)
- nextPaymentDate: Date (calculated)
- paymentDay: Number (1-31, day of month for EMI)
- prepaymentPenalty: Number (percentage)
- insuranceAmount: Number (optional)
- processingFee: Number (optional)
- createdAt: Date
- updatedAt: Date

Virtual Fields:
- paidAmount: Total amount paid so far
- remainingTenure: Months remaining
- completionPercentage: Progress percentage
```

**2. LoanPayment Model** (`backend/models/LoanPayment.js`)
```javascript
Schema Fields:
- loanId: ObjectId (ref: Loan, required)
- userId: ObjectId (ref: User, required)
- paymentDate: Date (required)
- paymentAmount: Number (required)
- principalPaid: Number (required)
- interestPaid: Number (required)
- remainingBalance: Number (after this payment)
- paymentNumber: Number (1, 2, 3...)
- paymentType: String (enum: ["regular", "extra", "prepayment", "final"])
- paymentMethod: String (enum: ["auto-debit", "manual", "online"])
- transactionId: ObjectId (ref: Transaction, optional - link to expense transaction)
- notes: String (optional)
- isLate: Boolean (default: false)
- lateFee: Number (default: 0)
- createdAt: Date
- updatedAt: Date
```

**3. AmortizationSchedule Model** (`backend/models/AmortizationSchedule.js`)
```javascript
Schema Fields:
- loanId: ObjectId (ref: Loan, required)
- userId: ObjectId (ref: User, required)
- schedule: Array of Objects [{
    paymentNumber: Number,
    paymentDate: Date,
    emiAmount: Number,
    principalAmount: Number,
    interestAmount: Number,
    remainingBalance: Number,
    isPaid: Boolean (default: false),
    actualPaymentDate: Date (null until paid)
  }]
- generatedAt: Date
- lastModified: Date
- totalEMI: Number
- totalPrincipal: Number
- totalInterest: Number
- isModified: Boolean (if prepayments made)
```

#### Indexes to Create
- Loan: `{ userId: 1, status: 1 }`
- LoanPayment: `{ loanId: 1, paymentDate: -1 }`
- AmortizationSchedule: `{ loanId: 1 }` (unique)

### Stage 1B: Backend API Development

#### Routes to Create (`backend/routes/loanRoutes.js`)

```javascript
Endpoints:

// Loan CRUD
POST   /api/loans                    - Create new loan
GET    /api/loans                    - Get all user loans
GET    /api/loans/:id                - Get specific loan details
PUT    /api/loans/:id                - Update loan details
DELETE /api/loans/:id                - Delete loan

// Calculations
POST   /api/loans/calculate-emi      - Calculate EMI (without saving)
POST   /api/loans/:id/recalculate    - Recalculate loan after changes

// Amortization
GET    /api/loans/:id/schedule       - Get amortization schedule
POST   /api/loans/:id/schedule       - Generate/regenerate schedule
GET    /api/loans/:id/schedule/download - Download schedule as PDF

// Payments
POST   /api/loans/:id/payments       - Record a payment
GET    /api/loans/:id/payments       - Get all payments for loan
PUT    /api/loans/:id/payments/:paymentId - Update payment
DELETE /api/loans/:id/payments/:paymentId - Delete payment

// Analysis
GET    /api/loans/:id/early-payoff   - Calculate early payoff scenarios
POST   /api/loans/:id/simulate-prepayment - Simulate extra payments
GET    /api/loans/summary            - Get all loans summary
GET    /api/loans/upcoming-payments  - Get upcoming payments (next 3 months)

// Reminders
GET    /api/loans/overdue            - Get overdue payments
POST   /api/loans/:id/reminder       - Send payment reminder
```

#### Controllers to Create (`backend/controllers/loanController.js`)

```javascript
Functions to Implement:

1. createLoan(req, res)
   - Validate input data
   - Calculate EMI, total interest, total payment
   - Create loan record
   - Generate amortization schedule
   - Create notification for first payment
   - Return loan details

2. getAllLoans(req, res)
   - Fetch all user loans
   - Include calculated fields (paid amount, remaining)
   - Sort by status and next payment date
   - Return with summary statistics

3. getLoanDetails(req, res)
   - Fetch loan with full details
   - Include payment history
   - Calculate current status
   - Return detailed object

4. updateLoan(req, res)
   - Update loan fields
   - Recalculate if amount/rate/tenure changed
   - Regenerate amortization schedule if needed
   - Return updated loan

5. deleteLoan(req, res)
   - Check if loan has payments
   - If yes, mark as closed instead of delete
   - If no, delete loan and schedule
   - Return confirmation

6. calculateEMI(req, res)
   - Take principal, rate, tenure
   - Calculate using formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
   - Return EMI, total interest, total payment
   - Return amortization summary

7. generateAmortizationSchedule(req, res)
   - Get loan details
   - Generate month-by-month breakdown
   - Save to AmortizationSchedule model
   - Return schedule array

8. recordPayment(req, res)
   - Validate payment details
   - Calculate principal and interest split
   - Update loan remaining balance
   - Mark schedule entry as paid
   - Create Transaction record (expense)
   - Send confirmation notification
   - Return payment record

9. getPaymentHistory(req, res)
   - Fetch all payments for loan
   - Include statistics (total paid, on-time percentage)
   - Return sorted by date

10. earlyPayoffAnalysis(req, res)
    - Calculate current payoff amount
    - Show interest saved
    - Calculate different prepayment scenarios
    - Return analysis object

11. simulatePrepayment(req, res)
    - Take extra payment amount and frequency
    - Recalculate schedule with prepayments
    - Show new tenure and interest savings
    - Return comparison (original vs new)

12. getLoansSummary(req, res)
    - Total loans count
    - Total borrowed amount
    - Total outstanding balance
    - Total monthly EMI commitment
    - Average interest rate
    - Return summary object

13. getUpcomingPayments(req, res)
    - Get all loans with upcoming payments (next 90 days)
    - Sort by payment date
    - Include amount and loan name
    - Return array

14. getOverduePayments(req, res)
    - Find payments past due date
    - Calculate late fees if applicable
    - Flag overdue loans
    - Return overdue list

15. sendPaymentReminder(req, res)
    - Create notification
    - Send email reminder
    - Log reminder sent
    - Return confirmation
```

### Stage 1C: Business Logic & Services

#### Service to Create (`backend/Services/loanCalculationService.js`)

```javascript
Functions to Implement:

1. calculateEMI(principal, annualRate, tenureMonths)
   - Convert annual rate to monthly
   - Apply EMI formula
   - Return EMI amount (rounded to 2 decimals)

2. calculateTotalPayment(emi, tenure)
   - Multiply EMI by number of payments
   - Return total amount to be paid

3. calculateTotalInterest(totalPayment, principal)
   - Subtract principal from total payment
   - Return interest amount

4. generateAmortizationSchedule(principal, annualRate, tenure, startDate)
   - Loop through each month
   - Calculate interest and principal split
   - Track remaining balance
   - Return array of payment objects

5. calculatePrincipalAndInterest(remainingBalance, monthlyRate, emi)
   - Interest = remainingBalance * monthlyRate
   - Principal = EMI - Interest
   - Return object { principal, interest }

6. calculateEarlyPayoffAmount(loan, currentDate)
   - Get remaining balance
   - Add any prepayment penalties
   - Return payoff amount

7. simulateExtraPayment(loan, extraAmount, frequency)
   - Generate new schedule with extra payments
   - Calculate new tenure
   - Calculate interest saved
   - Return comparison object

8. calculateRemainingBalance(loan)
   - Get all paid EMIs
   - Subtract from original schedule
   - Return current balance

9. checkPaymentDue(loan, currentDate)
   - Get next payment date from schedule
   - Compare with current date
   - Return boolean and days overdue

10. calculateLoanToValueRatio(loanAmount, assetValue)
    - Return (loanAmount / assetValue) * 100

11. recalculateScheduleAfterPrepayment(loan, prepaymentAmount)
    - Reduce principal
    - Regenerate schedule
    - Return new schedule

12. calculateEffectiveInterestRate(loan)
    - Include processing fees and other charges
    - Calculate real cost of borrowing
    - Return effective rate
```

### Stage 1D: Frontend Components

#### Components to Create

**1. Loans List Page** (`frontend/src/pages/Loans.jsx`)
```javascript
Features:
- Display all loans in card format
- Show key metrics: EMI, remaining balance, progress bar
- Color-coded by status (active: green, overdue: red)
- Search and filter loans (by type, status)
- Sort loans (by amount, EMI, end date)
- Quick actions: View details, Record payment, Delete
- Add new loan button (opens modal)
- Summary cards at top (Total loans, Total EMI, Total outstanding)
```

**2. Add/Edit Loan Modal** (`frontend/src/components/loans/LoanForm.jsx`)
```javascript
Form Fields:
- Loan name (text input)
- Loan type (dropdown)
- Principal amount (number input)
- Interest rate (number input with % symbol)
- Tenure (number input with month/year selector)
- Start date (date picker)
- Payment day (1-31 selector)
- Lender name (text input)
- Account number (optional text)
- Processing fee (optional number)
- Notes (textarea)

Actions:
- Calculate EMI preview (real-time as user types)
- Submit button (Create/Update)
- Cancel button
- Validation messages
```

**3. Loan Details Page** (`frontend/src/pages/LoanDetails.jsx`)
```javascript
Sections:
- Loan overview card (name, type, lender, account)
- Key metrics cards (EMI, total interest, remaining balance, progress)
- Progress bar (visual representation)
- Quick actions (Record payment, Download schedule, Edit loan)
- Amortization schedule table (with pagination)
- Payment history timeline
- Early payoff calculator section
- Prepayment simulator section
```

**4. EMI Calculator Widget** (`frontend/src/components/loans/EMICalculator.jsx`)
```javascript
Features:
- Standalone calculator (usable without creating loan)
- Principal amount slider + input
- Interest rate slider + input
- Tenure slider + input
- Real-time EMI calculation
- Visual breakdown chart (Principal vs Interest)
- Total payment and total interest display
- Save as loan button
```

**5. Amortization Schedule Table** (`frontend/src/components/loans/AmortizationTable.jsx`)
```javascript
Columns:
- Payment # | Due Date | EMI Amount | Principal | Interest | Balance | Status
Table Features:
- Pagination (12 rows per page)
- Highlight current payment
- Mark paid payments (checkmark icon)
- Filter by paid/unpaid
- Download as PDF/CSV buttons
- Print friendly view
```

**6. Record Payment Modal** (`frontend/src/components/loans/RecordPaymentModal.jsx`)
```javascript
Form Fields:
- Payment date (date picker, default: today)
- Payment amount (number, default: EMI amount)
- Payment type (dropdown: regular/extra/prepayment)
- Payment method (dropdown)
- Transaction link (optional, link to expense transaction)
- Notes (textarea)
- Auto-create expense transaction (checkbox)

Features:
- Show principal/interest breakdown for payment
- Show updated remaining balance
- Validate payment amount
- Submit button
```

**7. Early Payoff Analyzer** (`frontend/src/components/loans/EarlyPayoffAnalyzer.jsx`)
```javascript
Features:
- Current loan summary
- Payoff amount calculator (for specific date)
- Extra payment scenarios table:
  * Extra ₹5,000/month
  * Extra ₹10,000/month
  * One-time ₹50,000 payment
  * Custom amount input
- For each scenario show:
  * New tenure
  * Interest saved
  * Time saved (months)
  * New EMI (if applicable)
- Apply scenario button (updates loan)
```

**8. Loan Summary Dashboard Widget** (`frontend/src/components/dashboard/LoanSummaryWidget.jsx`)
```javascript
Display:
- Total active loans count
- Total monthly EMI commitment
- Total outstanding balance
- Next payment due (date and amount)
- Mini chart (EMI trend)
- View all loans link
```

### Stage 1E: Integration & Testing

#### Integration Points
1. **With Transactions**: Auto-create expense transaction when recording EMI payment
2. **With Notifications**: Send reminders 3 days before payment due
3. **With Budget**: Include EMI in monthly budget calculations
4. **With Financial Health**: Factor loan EMI into expense ratio
5. **With Goals**: Show loan payoff as goal type

#### API Integration Steps
1. Create loan routes and import in `server.js`
2. Add loan routes to API: `app.use('/api/loans', loanRoutes)`
3. Test all endpoints with Postman
4. Create frontend API service: `frontend/src/services/loanApi.js`
5. Connect components to API
6. Test full flow: Create → View → Pay → Analyze

#### Testing Checklist
- [ ] EMI calculation accuracy (verify with online calculators)
- [ ] Amortization schedule correctness
- [ ] Payment recording updates balance correctly
- [ ] Prepayment scenarios calculate correctly
- [ ] Date calculations handle month-end correctly
- [ ] Validation prevents negative values
- [ ] User can only access their own loans
- [ ] Schedule regenerates after loan modification
- [ ] Export features work correctly
- [ ] Notifications trigger on time

### Stage 1F: Polish & Optimization

#### Enhancements
1. **Charts**: Add visual charts for payment history and schedule
2. **Notifications**: Email reminders for upcoming payments
3. **Mobile Responsive**: Ensure all components work on mobile
4. **Export**: PDF generation for amortization schedule
5. **Bulk Actions**: Record multiple payments at once
6. **Loan Comparison**: Compare different loan offers side-by-side
7. **Refinancing Calculator**: Calculate benefits of refinancing
8. **Debt Snowball/Avalanche**: Strategy calculator for multiple loans

---

## Feature 2: Net Worth Tracking

### Overview
Comprehensive wealth management system tracking assets, liabilities, and net worth over time.

### Stage 2A: Database Schema Design

#### Models to Create

**1. Asset Model** (`backend/models/Asset.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- assetName: String (required, e.g., "Primary Home", "Savings Account")
- assetType: String (enum: [
    "cash",
    "bank_account",
    "stock",
    "mutual_fund",
    "bond",
    "real_estate",
    "vehicle",
    "retirement_account",
    "business",
    "cryptocurrency",
    "precious_metals",
    "personal_property",
    "other"
  ], required)
- category: String (enum: ["liquid", "investment", "fixed", "personal"])
- currentValue: Number (required, min: 0)
- purchaseValue: Number (optional)
- purchaseDate: Date (optional)
- quantity: Number (default: 1, for stocks/crypto)
- description: String (optional)
- location: String (optional, for real estate)
- institution: String (optional, bank/broker name)
- accountNumber: String (optional)
- autoUpdate: Boolean (default: false, for API-connected assets)
- lastUpdated: Date (auto, when value changes)
- appreciationRate: Number (optional, annual % gain/loss)
- notes: String (optional)
- status: String (enum: ["active", "sold", "archived"], default: "active")
- createdAt: Date
- updatedAt: Date

Virtual Fields:
- gain: currentValue - purchaseValue
- gainPercentage: (gain / purchaseValue) * 100
- holdingPeriod: days since purchase
```

**2. Liability Model** (`backend/models/Liability.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- liabilityName: String (required, e.g., "Home Mortgage", "Credit Card")
- liabilityType: String (enum: [
    "home_mortgage",
    "auto_loan",
    "student_loan",
    "personal_loan",
    "credit_card",
    "business_loan",
    "medical_debt",
    "tax_debt",
    "other"
  ], required)
- category: String (enum: ["secured", "unsecured"])
- outstandingBalance: Number (required, min: 0)
- originalAmount: Number (optional)
- interestRate: Number (optional)
- minimumPayment: Number (optional)
- dueDate: Date (optional, monthly due date)
- creditor: String (optional, lender name)
- accountNumber: String (optional)
- startDate: Date (optional)
- loanId: ObjectId (ref: Loan, optional - link to loan module)
- notes: String (optional)
- status: String (enum: ["active", "paid", "settled", "default"], default: "active")
- priority: Number (1-5, for debt payoff strategy)
- createdAt: Date
- updatedAt: Date

Virtual Fields:
- paidAmount: originalAmount - outstandingBalance
- payoffPercentage: (paidAmount / originalAmount) * 100
```

**3. NetWorthSnapshot Model** (`backend/models/NetWorthSnapshot.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- snapshotDate: Date (required)
- totalAssets: Number (required)
- totalLiabilities: Number (required)
- netWorth: Number (required, totalAssets - totalLiabilities)
- assetBreakdown: Object {
    cash: Number,
    investments: Number,
    realEstate: Number,
    vehicles: Number,
    retirement: Number,
    other: Number
  }
- liabilityBreakdown: Object {
    mortgages: Number,
    loans: Number,
    creditCards: Number,
    other: Number
  }
- change: Object {
    amount: Number (vs previous snapshot),
    percentage: Number,
    period: String (e.g., "1 month")
  }
- notes: String (optional)
- isAutomatic: Boolean (default: true, auto-generated)
- createdAt: Date
- updatedAt: Date
```

**4. AssetHistory Model** (`backend/models/AssetHistory.js`)
```javascript
Schema Fields:
- assetId: ObjectId (ref: Asset, required)
- userId: ObjectId (ref: User, required)
- date: Date (required)
- value: Number (required)
- change: Number (vs previous value)
- changePercentage: Number
- source: String (enum: ["user", "api", "automatic"], default: "user")
- notes: String (optional)
- createdAt: Date
```

#### Indexes to Create
- Asset: `{ userId: 1, status: 1, assetType: 1 }`
- Liability: `{ userId: 1, status: 1 }`
- NetWorthSnapshot: `{ userId: 1, snapshotDate: -1 }`
- AssetHistory: `{ assetId: 1, date: -1 }`

### Stage 2B: Backend API Development

#### Routes to Create (`backend/routes/netWorthRoutes.js`)

```javascript
Endpoints:

// Assets
POST   /api/networth/assets                - Add new asset
GET    /api/networth/assets                - Get all assets
GET    /api/networth/assets/:id            - Get specific asset
PUT    /api/networth/assets/:id            - Update asset value/details
DELETE /api/networth/assets/:id            - Delete/archive asset
GET    /api/networth/assets/:id/history    - Get value history
POST   /api/networth/assets/:id/history    - Add manual value update
GET    /api/networth/assets/summary        - Get assets summary by category

// Liabilities
POST   /api/networth/liabilities           - Add new liability
GET    /api/networth/liabilities           - Get all liabilities
GET    /api/networth/liabilities/:id       - Get specific liability
PUT    /api/networth/liabilities/:id       - Update liability balance
DELETE /api/networth/liabilities/:id       - Delete/archive liability
GET    /api/networth/liabilities/summary   - Get liabilities summary

// Net Worth
GET    /api/networth/current               - Get current net worth
GET    /api/networth/history               - Get historical snapshots
POST   /api/networth/snapshot              - Create manual snapshot
GET    /api/networth/trend                 - Get trend analysis
GET    /api/networth/breakdown             - Get detailed breakdown
GET    /api/networth/comparison            - Compare periods (MoM, YoY)
GET    /api/networth/projection            - Project future net worth
GET    /api/networth/export                - Export data (CSV/PDF)
```

#### Controllers to Create (`backend/controllers/netWorthController.js`)

```javascript
Functions to Implement:

// Asset Management
1. addAsset(req, res)
2. getAllAssets(req, res)
3. getAssetDetails(req, res)
4. updateAsset(req, res)
5. deleteAsset(req, res)
6. getAssetHistory(req, res)
7. recordAssetValue(req, res)
8. getAssetsSummary(req, res)

// Liability Management
9. addLiability(req, res)
10. getAllLiabilities(req, res)
11. getLiabilityDetails(req, res)
12. updateLiability(req, res)
13. deleteLiability(req, res)
14. getLiabilitiesSummary(req, res)

// Net Worth Calculation
15. getCurrentNetWorth(req, res)
16. getNetWorthHistory(req, res)
17. createSnapshot(req, res)
18. getTrendAnalysis(req, res)
19. getDetailedBreakdown(req, res)
20. comparePerio ds(req, res)
21. projectNetWorth(req, res)
22. exportNetWorthReport(req, res)
```

### Stage 2C: Business Logic & Services

#### Service to Create (`backend/Services/netWorthCalculationService.js`)

```javascript
Functions to Implement:

1. calculateTotalAssets(userId)
   - Sum all active assets current values
   - Return total

2. calculateTotalLiabilities(userId)
   - Sum all active liabilities outstanding balances
   - Return total

3. calculateNetWorth(userId)
   - Get total assets
   - Get total liabilities
   - Return assets - liabilities

4. categorizeAssets(assets)
   - Group by asset type
   - Calculate category totals
   - Return breakdown object

5. categorizeLiabilities(liabilities)
   - Group by liability type
   - Calculate category totals
   - Return breakdown object

6. generateSnapshot(userId)
   - Calculate current net worth
   - Get breakdown
   - Create NetWorthSnapshot document
   - Return snapshot

7. calculateChange(current, previous)
   - Calculate amount difference
   - Calculate percentage change
   - Determine trend (up/down)
   - Return change object

8. getGrowthTrend(snapshots, period)
   - Analyze snapshots over period
   - Calculate average growth rate
   - Identify trends
   - Return trend data

9. projectFutureNetWorth(currentNetWorth, growthRate, months)
   - Apply compound growth
   - Return projected values array

10. calculateAssetAllocation(assets)
    - Calculate percentage breakdown
    - Identify overweight/underweight categories
    - Return allocation object

11. calculateDebtToAssetRatio(totalLiabilities, totalAssets)
    - Return (liabilities / assets) * 100

12. calculateLiquidityRatio(liquidAssets, shortTermLiabilities)
    - Return liquid assets / short-term debts

13. identifyMilestones(netWorthHistory)
    - Find significant events (crossed 0, 100K, 1M, etc.)
    - Return milestone array

14. generateRecommendations(netWorthBreakdown)
    - Analyze asset allocation
    - Suggest improvements
    - Return recommendations array
```

### Stage 2D: Frontend Components

#### Components to Create

**1. Net Worth Dashboard** (`frontend/src/pages/NetWorth.jsx`)
```javascript
Sections:
- Header with current net worth (large display)
- Change indicators (vs last month, last year)
- Quick action buttons (Add asset, Add liability, Take snapshot)
- Net worth trend chart (line chart, last 12 months)
- Asset vs Liability donut chart
- Summary cards (Total assets, Total liabilities, Debt-to-asset ratio)
- Recent assets list (top 5)
- Recent liabilities list (top 5)
- Milestone achievements
- View detailed breakdown button
```

**2. Assets Page** (`frontend/src/pages/Assets.jsx`)
```javascript
Features:
- Assets list grouped by category
- Each asset card shows: Name, Type, Current value, Gain/loss
- Search and filter (by type, category)
- Sort options (by value, gain, date)
- Add asset button
- Edit/Delete actions on each card
- Total assets at top
- Category breakdown chart
```

**3. Add/Edit Asset Modal** (`frontend/src/components/networth/AssetForm.jsx`)
```javascript
Form Fields:
- Asset name
- Asset type (dropdown with icons)
- Category (auto-selected based on type)
- Current value
- Purchase value (optional)
- Purchase date (optional)
- Quantity (for stocks/crypto)
- Institution/Broker (optional)
- Account number (optional)
- Description
- Notes

Features:
- Real-time gain/loss calculation
- Icon preview based on type
- Submit and Add another button
- Cancel button
```

**4. Liabilities Page** (`frontend/src/pages/Liabilities.jsx`)
```javascript
Features:
- Liabilities list grouped by category
- Each card shows: Name, Type, Outstanding, Interest rate, Min. payment
- Progress bar (amount paid vs original)
- Debt payoff priority indicator
- Add liability button
- Edit/Delete actions
- Total liabilities at top
- Debt payoff strategy calculator
```

**5. Add/Edit Liability Modal** (`frontend/src/components/networth/LiabilityForm.jsx`)
```javascript
Form Fields:
- Liability name
- Liability type (dropdown)
- Outstanding balance
- Original amount (optional)
- Interest rate (optional)
- Minimum payment (optional)
- Due date (optional)
- Creditor name
- Priority (1-5 stars)
- Notes

Features:
- Progress calculation display
- Link to loan (if applicable)
- Submit button
- Cancel button
```

**6. Net Worth History Page** (`frontend/src/pages/NetWorthHistory.jsx`)
```javascript
Features:
- Timeline view of snapshots
- Interactive line chart (zoomable)
- Comparison period selector (1M, 3M, 6M, 1Y, All)
- Snapshot cards in chronological order
- Each snapshot shows: Date, Net worth, Change, Breakdown
- Export all data button
- Generate report button
```

**7. Detailed Breakdown View** (`frontend/src/components/networth/DetailedBreakdown.jsx`)
```javascript
Display:
- Assets section:
  * Table with all assets
  * Category totals
  * Allocation percentages
  * Allocation pie chart
- Liabilities section:
  * Table with all liabilities
  * Category totals
  * Type percentages
  * Liability chart
- Metrics cards:
  * Debt-to-asset ratio
  * Liquidity ratio
  * Net worth change (MoM, YoY)
- Recommendations panel
```

**8. Net Worth Projection Tool** (`frontend/src/components/networth/ProjectionTool.jsx`)
```javascript
Features:
- Current net worth display
- Growth rate input (slider/input)
- Time horizon input (months/years)
- Scenario builder:
  * Optimistic (higher growth)
  * Realistic (current trend)
  * Pessimistic (lower growth)
- Projection chart showing multiple scenarios
- Milestone markers (when reaching goals)
- Export projection button
```

**9. Net Worth Summary Widget** (`frontend/src/components/dashboard/NetWorthWidget.jsx`)
```javascript
Display:
- Current net worth (prominent)
- Change indicator (up/down with percentage)
- Mini chart (sparkline)
- Quick stats (Assets, Liabilities)
- View details link
```

### Stage 2E: Integration & Testing

#### Integration Points
1. **With Loans**: Auto-import loan balances as liabilities
2. **With Goals**: Link net worth milestones to goals
3. **With Transactions**: Consider wallet balance as liquid asset
4. **With Dashboard**: Display net worth widget
5. **With Reports**: Include in financial reports

#### Automated Snapshot Creation
- Schedule job to run monthly (1st of each month)
- Calculate net worth automatically
- Create snapshot record
- Send notification to user with summary

#### Testing Checklist
- [ ] Net worth calculation accurate
- [ ] Asset value updates reflect correctly
- [ ] Liability updates reflect correctly
- [ ] Historical snapshots maintain integrity
- [ ] Charts render correctly
- [ ] Category breakdowns sum correctly
- [ ] Projections calculate accurately
- [ ] Export functions work
- [ ] Mobile responsive
- [ ] User can only see own data

### Stage 2F: Polish & Optimization

#### Enhancements
1. **Investment API Integration**: Auto-update stock/crypto prices
2. **Real Estate Valuation**: Zillow API integration for property values
3. **Currency Conversion**: Multi-currency asset support
4. **Asset Photos**: Upload images for assets
5. **Bulk Import**: CSV import for assets/liabilities
6. **Achievement System**: Badges for milestones
7. **Sharing**: Share net worth progress (anonymously)
8. **Alerts**: Notify when net worth crosses milestones

---

## Feature 3: Tax Planning Module

### Overview
Intelligent tax planning system with calculations, deduction tracking, and tax-saving recommendations.

### Stage 3A: Database Schema Design

#### Models to Create

**1. TaxProfile Model** (`backend/models/TaxProfile.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required, e.g., 2026)
- country: String (required, default: "IN")
- filingStatus: String (enum: ["individual", "married_joint", "married_separate", "head_of_household"], required)
- taxRegime: String (enum: ["old", "new"], default: "new" for India)
- employmentType: String (enum: ["salaried", "self_employed", "business", "freelancer", "retired"])
- panNumber: String (optional, for India)
- aadharNumber: String (optional, encrypted)
- taxSlabRate: Number (calculated based on income)
- residentialStatus: String (enum: ["resident", "non_resident", "rnor"])
- createdAt: Date
- updatedAt: Date
```

**2. TaxIncome Model** (`backend/models/TaxIncome.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required)
- incomeType: String (enum: [
    "salary",
    "house_property",
    "capital_gains",
    "business_profession",
    "other_sources"
  ], required)
- incomeHead: String (detailed category)
- amount: Number (required)
- description: String
- isTaxable: Boolean (default: true)
- isExempt: Boolean (default: false)
- exemptionAmount: Number (default: 0)
- documentId: String (optional, link to uploaded doc)
- transactionIds: Array of ObjectId (ref: Transaction, optional)
- quarter: Number (1-4, for quarterly tracking)
- createdAt: Date
- updatedAt: Date
```

**3. TaxDeduction Model** (`backend/models/TaxDeduction.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required)
- deductionType: String (enum: [
    "80C", "80D", "80E", "80G", "80TTA", "24B",
    "standard_deduction", "nps", "medical_insurance",
    "home_loan_interest", "education_loan", "charity",
    "other"
  ], required)
- section: String (e.g., "Section 80C")
- deductionName: String (e.g., "PPF Investment", "LIC Premium")
- amount: Number (required)
- maxLimit: Number (based on section)
- eligibleAmount: Number (min of amount and maxLimit)
- description: String
- investmentDate: Date (optional)
- documentId: String (optional)
- transactionId: ObjectId (ref: Transaction, optional)
- verificationStatus: String (enum: ["pending", "verified", "rejected"], default: "pending")
- notes: String
- createdAt: Date
- updatedAt: Date
```

**4. TaxCalculation Model** (`backend/models/TaxCalculation.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required)
- calculationDate: Date (required)
- grossIncome: Number (required)
- totalDeductions: Number (required)
- taxableIncome: Number (required, grossIncome - deductions)
- taxBeforeRebate: Number (required)
- rebates: Number (default: 0, e.g., Section 87A)
- surcharge: Number (default: 0, for high income)
- cess: Number (required, health & education cess)
- totalTaxLiability: Number (required)
- tdsPaid: Number (default: 0)
- advanceTaxPaid: Number (default: 0)
- totalTaxPaid: Number
- refundDue: Number (if overpaid)
- taxDue: Number (if underpaid)
- effectiveTaxRate: Number (percentage)
- regime: String (enum: ["old", "new"])
- breakdown: Object {
    slabs: Array [{
      from: Number,
      to: Number,
      rate: Number,
      tax: Number
    }]
  }
- savingsOpportunities: Array [Objects of potential savings]
- createdAt: Date
- updatedAt: Date
```

**5. TaxDocument Model** (`backend/models/TaxDocument.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required)
- documentType: String (enum: [
    "form16", "form26as", "investment_proof",
    "rent_receipt", "interest_certificate",
    "donation_receipt", "other"
  ], required)
- documentName: String (required)
- fileName: String (required)
- fileUrl: String (required)
- fileSize: Number
- mimeType: String
- uploadDate: Date (default: Date.now)
- relatedDeductionId: ObjectId (ref: TaxDeduction, optional)
- relatedIncomeId: ObjectId (ref: TaxIncome, optional)
- isVerified: Boolean (default: false)
- notes: String
- createdAt: Date
- updatedAt: Date
```

**6. TaxPayment Model** (`backend/models/TaxPayment.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- taxYear: Number (required)
- paymentType: String (enum: ["tds", "advance_tax", "self_assessment", "refund"], required)
- amount: Number (required)
- paymentDate: Date (required)
- quarter: Number (1-4, for advance tax)
- challanNumber: String (optional)
- bankName: String (optional)
- transactionId: ObjectId (ref: Transaction, optional)
- receiptUrl: String (optional)
- notes: String
- createdAt: Date
- updatedAt: Date
```

#### Indexes to Create
- TaxProfile: `{ userId: 1, taxYear: 1 }` (unique)
- TaxIncome: `{ userId: 1, taxYear: 1, incomeType: 1 }`
- TaxDeduction: `{ userId: 1, taxYear: 1, deductionType: 1 }`
- TaxCalculation: `{ userId: 1, taxYear: 1, calculationDate: -1 }`
- TaxDocument: `{ userId: 1, taxYear: 1 }`
- TaxPayment: `{ userId: 1, taxYear: 1 }`

### Stage 3B: Backend API Development

#### Routes to Create (`backend/routes/taxRoutes.js`)

```javascript
Endpoints:

// Tax Profile
POST   /api/tax/profile                    - Create/update tax profile
GET    /api/tax/profile/:year              - Get tax profile for year
GET    /api/tax/profile/current            - Get current year profile

// Income
POST   /api/tax/income                     - Add income entry
GET    /api/tax/income/:year               - Get all income for year
PUT    /api/tax/income/:id                 - Update income entry
DELETE /api/tax/income/:id                 - Delete income entry
GET    /api/tax/income/:year/summary       - Get income summary

// Deductions
POST   /api/tax/deductions                 - Add deduction
GET    /api/tax/deductions/:year           - Get all deductions for year
PUT    /api/tax/deductions/:id             - Update deduction
DELETE /api/tax/deductions/:id             - Delete deduction
GET    /api/tax/deductions/:year/summary   - Get deductions summary by section
GET    /api/tax/deductions/opportunities   - Get saving opportunities

// Tax Calculation
POST   /api/tax/calculate                  - Calculate tax liability
GET    /api/tax/calculation/:year          - Get tax calculation for year
GET    /api/tax/compare-regimes/:year      - Compare old vs new tax regime
GET    /api/tax/slab-details/:income       - Get applicable tax slab

// Documents
POST   /api/tax/documents/upload           - Upload tax document
GET    /api/tax/documents/:year            - Get all documents for year
DELETE /api/tax/documents/:id              - Delete document
GET    /api/tax/documents/:id/download     - Download document

// Payments
POST   /api/tax/payments                   - Record tax payment
GET    /api/tax/payments/:year             - Get all payments for year
PUT    /api/tax/payments/:id               - Update payment
DELETE /api/tax/payments/:id               - Delete payment

// Reports & Planning
GET    /api/tax/summary/:year              - Complete tax summary
GET    /api/tax/projection/:year           - Project tax for remaining months
GET    /api/tax/recommendations/:year      - Get tax-saving recommendations
POST   /api/tax/export/:year               - Export tax report (PDF)
GET    /api/tax/deadline-reminders         - Get upcoming tax deadlines
```

#### Controllers to Create (`backend/controllers/taxController.js`)

```javascript
Functions to Implement:

// Profile Management
1. createOrUpdateProfile(req, res)
2. getTaxProfile(req, res)

// Income Management
3. addIncome(req, res)
4. getAllIncome(req, res)
5. updateIncome(req, res)
6. deleteIncome(req, res)
7. getIncomeSummary(req, res)

// Deduction Management
8. addDeduction(req, res)
9. getAllDeductions(req, res)
10. updateDeduction(req, res)
11. deleteDeduction(req, res)
12. getDeductionsSummary(req, res)
13. getSavingOpportunities(req, res)

// Tax Calculation
14. calculateTax(req, res)
15. getTaxCalculation(req, res)
16. compareRegimes(req, res)
17. getSlabDetails(req, res)

// Document Management
18. uploadDocument(req, res)
19. getAllDocuments(req, res)
20. deleteDocument(req, res)
21. downloadDocument(req, res)

// Payment Tracking
22. recordPayment(req, res)
23. getAllPayments(req, res)
24. updatePayment(req, res)
25. deletePayment(req, res)

// Reports & Planning
26. getTaxSummary(req, res)
27. projectTax(req, res)
28. getRecommendations(req, res)
29. exportTaxReport(req, res)
30. getDeadlineReminders(req, res)
```

### Stage 3C: Business Logic & Services

#### Service to Create (`backend/Services/taxCalculationService.js`)

```javascript
Functions to Implement:

1. calculateIndiaTax(income, regime, deductions)
   - Implement slab-based calculation
   - Apply standard deduction
   - Apply deductions (80C, 80D, etc.)
   - Calculate rebate (Section 87A if eligible)
   - Calculate surcharge (if high income)
   - Calculate health & education cess (4%)
   - Return detailed breakdown

2. getIndTaxSlabs(year, regime)
   - Return applicable tax slabs for year and regime
   - New vs Old regime differences

3. calculateStandardDeduction(income, employmentType)
   - ₹50,000 for salaried (FY 2023-24)
   - Return amount

4. calculateSection80CLimit(investments)
   - Max ₹1,50,000
   - Sum PPF, LIC, ELSS, EPF, etc.
   - Return eligible amount

5. calculateSection 80DLimit(medicalInsurance)
   - Max ₹25,000 (self, spouse, children)
   - Max ₹50,000 (senior citizens)
   - Max additional ₹25,000 (parents)
   - Return eligible amount

6. calculateHomeLoanInterest(interest)
   - Max ₹2,00,000 (Section 24B)
   - Return eligible amount

7. calculateSection87ARebate(taxableIncome, tax)
   - If income ≤ ₹5,00,000: rebate = lower of tax or ₹12,500
   - Return rebate amount

8. calculateEffectiveTaxRate(totalTax, grossIncome)
   - Return (totalTax / grossIncome) * 100

9. compareOldVsNewRegime(income, deductions)
   - Calculate tax under both regimes
   - Return comparison with recommendation

10. identifySavingOpportunities(profile, income, deductions)
    - Check unused 80C limit
    - Check unused 80D limit
    - Check NPS advantage
    - Suggest additional investments
    - Return opportunities array

11. projectYearEndTax(currentIncome, deductions, monthsRemaining)
    - Estimate full year income
    - Project potential deductions
    - Calculate expected tax
    - Return projection

12. calculateAdvanceTaxDue(estimatedTax, quarterdue)
    - Q1: 15% by June 15
    - Q2: 45% by Sep 15
    - Q3: 75% by Dec 15
    - Q4: 100% by Mar 15
    - Return amount due

13. calculateTDSRefund(totalTax, tdsPaid)
    - If tdsPaid > totalTax: refund = difference
    - Return refund amount

14. generateTaxSummaryReport(userId, year)
    - Compile all income, deductions, calculations
    - Return comprehensive report object

15. getTaxDeadlines(year)
    - Return array of deadline objects
    - Include advance tax, ITR filing, etc.
```

### Stage 3D: Frontend Components

#### Components to Create

**1. Tax Dashboard** (`frontend/src/pages/TaxPlanning.jsx`)
```javascript
Sections:
- Tax profile card (Year, Regime, Status)
- Key metrics cards:
  * Gross Income
  * Total Deductions
  * Taxable Income
  * Tax Liability
  * Tax Paid
  * Refund/Due
- Calculate tax button (prominent)
- Quick actions: Add income, Add deduction, Upload document
- Progress bars:
  * Deduction utilization (80C, 80D used out of limit)
  * Tax payment progress
- Income breakdown chart (pie chart)
- Deductions breakdown chart
- Upcoming deadlines section
- Tax-saving opportunities panel
- Compare regimes button
```

**2. Tax Profile Setup** (`frontend/src/components/tax/TaxProfileForm.jsx`)
```javascript
Form Fields:
- Tax year (dropdown, current and previous years)
- Country (default IN)
- Filing status (dropdown)
- Tax regime (Old/New selector with info)
- Employment type (dropdown)
- PAN number (validated format)
- Residential status (dropdown)

Features:
- Info tooltips for each field
- Regime comparison helper
- Save profile button
- Profile completeness indicator
```

**3. Add Income Modal** (`frontend/src/components/tax/IncomeForm.jsx`)
```javascript
Form Fields:
- Income type (dropdown: Salary, House Property, etc.)
- Income head (sub-category)
- Amount
- Is taxable (checkbox)
- Is exempt (checkbox, shows exemption amount field)
- Description
- Quarter (1-4 selector)
- Link transaction (optional)

Features:
- Category-specific fields (e.g., house property shows city, rent)
- Real-time taxable calculation
- Submit button
```

**4. Add Deduction Modal** (`frontend/src/components/tax/DeductionForm.jsx`)
```javascript
Form Fields:
- Deduction section (dropdown: 80C, 80D, etc.)
- Deduction name (e.g., PPF, LIC)
- Amount invested
- Investment date
- Upload proof (file upload)
- Description
- Link transaction (optional)

Features:
- Show section limit
- Show already used amount
- Show remaining limit
- Show eligible amount calculation
- Color-coded limit usage (green/yellow/red)
- Submit and add another button
```

**5. Tax Calculator Page** (`frontend/src/pages/TaxCalculator.jsx`)
```javascript
Sections:
- Summary inputs:
  * Total income (from database or manual)
  * Total deductions (from database or manual)
  * TDS already paid
- Calculate button
- Results display:
  * Tax slab breakdown table
  * Step-by-step calculation
  * Final tax liability (large display)
  * Effective tax rate
  * Refund or additional payment due
- Save calculation button
- Download report button
- What-if simulator (change income and see impact)
```

**6. Regime Comparison Tool** (`frontend/src/components/tax/RegimeComparison.jsx`)
```javascript
Display:
- Side-by-side comparison
- Old Regime column:
  * Income
  * Deductions allowed
  * Taxable income
  * Tax calculated
- New Regime column:
  * Income
  * Deductions (NA except few)
  * Lower slab rates shown
  * Tax calculated
- Difference highlighted
- Recommended regime (based on calculation)
- Switch regime button
```

**7. Deduction Tracker** (`frontend/src/pages/Deductions.jsx`)
```javascript
Features:
- Section-wise deduction cards
- Each card shows:
  * Section name and limit
  * Amount utilized
  * Progress bar
  * Remaining limit
  * List of deductions under section
- Add deduction button for each section
- Total deductions summary at top
- Edit/Delete actions on each deduction
- Upload proof option
- Suggestions for unused limits
```

**8. Income Tracker** (`frontend/src/pages/TaxIncome.jsx`)
```javascript
Features:
- Income entries list by type
- Each entry card shows: Head, Amount, Taxable/Exempt
- Filter by income type
- Filter by quarter
- Add income button
- Total income summary cards:
  * Total income
  * Taxable income
  * Exempt income
- Edit/Delete actions
- Link to transaction feature
```

**9. Tax Documents Manager** (`frontend/src/components/tax/DocumentManager.jsx`)
```javascript
Features:
- Document list by type
- Each document card shows:
  * Type icon
  * Name
  * Upload date
  * File size
  * Related deduction/income
  * Verification status
- Upload button (drag-and-drop supported)
- View/Download buttons
- Delete with confirmation
- Search documents
- Filter by type, verification status
```

**10. Tax Report Generator** (`frontend/src/components/tax/TaxReport.jsx`)
```javascript
Report Sections:
- Personal details
- Income summary table
- Deductions summary table
- Tax calculation breakdown
- Tax payments made
- Refund/tax due
- Recommendations for next year
- Document checklist
- Export as PDF button
- Email report button
```

**11. Tax Savings Opportunities Panel** (`frontend/src/components/tax/SavingsOpportunities.jsx`)
```javascript
Display:
- List of opportunities with potential savings
- Examples:
  * "Invest ₹50,000 more in 80C to save ₹15,600"
  * "Add health insurance (80D) to save ₹7,800"
  * "Consider NPS (80CCD1B) for additional ₹15,600 saving"
- Each opportunity shows:
  * Suggestion
  * Investment needed
  * Tax saved
  * Action button (take me there)
- Prioritized by savings amount
- Update recommendations button
```

**12. Tax Deadline Calendar** (`frontend/src/components/tax/TaxDeadlines.jsx`)
```javascript
Display:
- Calendar view or list view toggle
- Upcoming deadlines:
  * Advance tax due dates (quarterly)
  * ITR filing deadline (July 31)
  * Belated return deadline (Dec 31)
  * Revised return deadline (Dec 31 of AY)
- Each deadline shows:
  * Date
  * Description
  * Action required
  * Completed status
- Set reminders (3 days, 1 week before)
- Mark as completed
```

**13. Tax Summary Widget** (`frontend/src/components/dashboard/TaxSummaryWidget.jsx`)
```javascript
Display:
- Current year tax status
- Tax liability (calculated)
- Tax paid so far
- Balance due/refund
- Next deadline (date and description)
- Quick action: Calculate tax
- View details link
```

### Stage 3E: Integration & Testing

#### Integration Points
1. **With Transactions**: Auto-categorize income/expense transactions as tax-relevant
2. **With Goals**: Create goal for tax-saving investments
3. **With Notifications**: Deadline reminders
4. **With Reports**: Include tax summary in annual reports
5. **With Documents**: Store Form 16, investment proofs

#### Document Upload Integration
1. Setup file storage (AWS S3, Cloudinary, or local storage)
2. Implement multer middleware for file uploads
3. Create upload service with file validation
4. Generate secure URLs for document access
5. Implement document preview for PDFs/images

#### Testing Checklist
- [ ] Tax calculation matches income tax department calculator
- [ ] All deduction sections have correct limits
- [ ] Regime comparison calculation accurate
- [ ] File upload works for all document types
- [ ] Maximum file size respected
- [ ] Deadline reminders trigger correctly
- [ ] Export PDF generates correctly
- [ ] Old vs new regime comparison accurate
- [ ] Projections calculate reasonably
- [ ] User can only access own tax data

### Stage 3F: Polish & Optimization

#### Enhancements
1. **eVerify Integration**: API integration with income tax portal
2. **Form 16 Parser**: Auto-extract data from Form 16 PDF
3. **Investment Tracking**: Auto-populate investments from linked banks
4. **CPA Chat**: Connect with tax professionals
5. **Multi-year Comparison**: Compare tax across years
6. **State Tax**: Add state tax calculations (for US)
7. **GST Module**: For self-employed users
8. **ITR Pre-fill**: Generate ITR-1/ITR-2 draft
9. **Mobile App**: Tax filing on the go
10. **Encrypted Storage**: Enhanced security for sensitive tax data

---

## Feature 4: Receipt OCR & Management

### Overview
AI-powered receipt scanning and automatic expense tracking using OCR technology.

### Stage 4A: Database Schema Design

#### Models to Create

**1. Receipt Model** (`backend/models/Receipt.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- receiptImage: Object {
    originalUrl: String (required),
    thumbnailUrl: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: Date
  }
- ocrData: Object {
    rawText: String,
    confidence: Number (0-100),
    processedAt: Date,
    ocrEngine: String (e.g., "tesseract", "google vision")
  }
- extractedData: Object {
    merchantName: String,
    merchantAddress: String,
    merchantPhone: String,
    date: Date,
    time: String,
    totalAmount: Number,
    subTotal: Number,
    tax: Number,
    tip: Number,
    discount: Number,
    paymentMethod: String,
    currency: String (default: "INR"),
    receiptNumber: String,
    items: Array [{
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }]
  }
- category: String (auto-suggested from merchant/items)
- tags: Array of String
- transactionId: ObjectId (ref: Transaction, optional - if linked)
- isVerified: Boolean (default: false, user confirms data)
- isExpense: Boolean (default: true)
- notes: String
- status: String (enum: ["uploaded", "processing", "processed", "error", "verified"], default: "uploaded")
- errorMessage: String (if OCR fails)
- processingAttempts: Number (default: 0, max 3)
- metadata: Object {
    location: Object {
      latitude: Number,
      longitude: Number
    },
    deviceInfo: String
  }
- createdAt: Date
- updatedAt: Date

Indexes:
- { userId: 1, createdAt: -1 }
- { userId: 1, status: 1 }
- { merchantName: 'text', notes: 'text' } (text index for search)
```

**2. ReceiptCategory Model** (`backend/models/ReceiptCategory.js`)
```javascript
Schema Fields:
- categoryName: String (required, unique)
- keywords: Array of String (for auto-categorization)
- merchantPatterns: Array of String (regex patterns)
- icon: String
- color: String
- isDefault: Boolean
- usageCount: Number (default: 0)
- createdAt: Date
- updatedAt: Date

Pre-populated Categories:
- Food & Dining (keywords: restaurant, cafe, food, dine)
- Groceries (keywords: supermarket, grocery, mart)
- Transportation (keywords: uber, taxi, fuel, petrol)
- Shopping (keywords: store, shop, retail, mall)
- Entertainment (keywords: movie, cinema, game, theatre)
- Healthcare (keywords: pharmacy, medical, doctor, hospital)
- Utilities (keywords: electricity, water, gas, internet)
```

**3. ReceiptVerification Model** (`backend/models/ReceiptVerification.js`)
```javascript
Schema Fields:
- receiptId: ObjectId (ref: Receipt, required)
- userId: ObjectId (ref: User, required)
- originalData: Object (OCR extracted data)
- correctedData: Object (user verified data)
- corrections: Array [{
    field: String,
    originalValue: any,
    correctedValue: any,
    timestamp: Date
  }]
- verifiedAt: Date
- verificationMethod: String (enum: ["manual", "auto"], default: "manual")
- createdAt: Date
```

#### Indexes to Create
- Receipt: `{ userId: 1, date: -1 }`
- ReceiptCategory: `{ categoryName: 1 }`
- ReceiptVerification: `{ receiptId: 1 }`

### Stage 4B: Backend API Development

#### Routes to Create (`backend/routes/receiptRoutes.js`)

```javascript
Endpoints:

// Receipt Upload & Processing
POST   /api/receipts/upload                - Upload receipt image
POST   /api/receipts/:id/reprocess         - Reprocess OCR
GET    /api/receipts/processing-status/:id - Check processing status

// Receipt CRUD
GET    /api/receipts                       - Get all receipts
GET    /api/receipts/:id                   - Get specific receipt
PUT    /api/receipts/:id                   - Update receipt data
DELETE /api/receipts/:id                   - Delete receipt
PATCH  /api/receipts/:id/verify            - Mark receipt as verified

// Receipt Management
GET    /api/receipts/unverified            - Get unverified receipts
GET    /api/receipts/recent                - Get recent receipts (last 30 days)
GET    /api/receipts/search                - Search receipts (text search)
GET    /api/receipts/by-merchant/:name     - Get receipts from specific merchant
GET    /api/receipts/by-category/:category - Get receipts by category
GET    /api/receipts/date-range            - Get receipts in date range

// Transaction Linking
POST   /api/receipts/:id/create-transaction - Create transaction from receipt
POST   /api/receipts/:id/link-transaction   - Link to existing transaction
DELETE /api/receipts/:id/unlink-transaction - Unlink transaction

// Analytics
GET    /api/receipts/stats                 - Get receipt statistics
GET    /api/receipts/merchants/top         - Get top merchants by spending
GET    /api/receipts/category-breakdown    - Get spending by category

// Export
GET    /api/receipts/export                - Export all receipts (CSV)
GET    /api/receipts/:id/download          - Download original image
```

#### Controllers to Create (`backend/controllers/receiptController.js`)

```javascript
Functions to Implement:

// Upload & Processing
1. uploadReceipt(req, res)
   - Validate image file
   - Save to storage
   - Create Receipt document (status: "uploaded")
   - Queue OCR processing job
   - Return receipt ID

2. processReceipt(receiptId)
   - Get receipt image
   - Call OCR service
   - Extract text
   - Parse data using regex/NLP
   - Update Receipt document with extracted data
   - Auto-suggest category
   - Update status to "processed"

3. reprocessReceipt(req, res)
   - Check processing attempts
   - Retry OCR with different settings
   - Update receipt data

4. getProcessingStatus(req, res)
   - Return current status
   - Return progress if applicable

// CRUD Operations
5. getAllReceipts(req, res)
   - Get user receipts with pagination
   - Include filters (verified, category, date)
   - Sort by date (newest first)
   - Return receipts array

6. getReceiptDetails(req, res)
   - Get receipt with full data
   - Include linked transaction
   - Return detailed object

7. updateReceipt(req, res)
   - Update extractedData fields
   - Allow manual corrections
   - Save original data for reference
   - Return updated receipt

8. deleteReceipt(req, res)
   - Delete image from storage
   - Delete receipt document
   - Unlink transaction if any
   - Return confirmation

9. verifyReceipt(req, res)
   - Mark receipt as verified
   - Create ReceiptVerification record
   - Return updated receipt

// Management
10. getUnverifiedReceipts(req, res)
    - Get receipts with status "processed"
    - Return list for user review

11. getRecentReceipts(req, res)
    - Get receipts from last 30 days
    - Return sorted by date

12. searchReceipts(req, res)
    - Text search in merchant name, notes
    - Return matching receipts

13. getReceiptsByMerchant(req, res)
    - Filter receipts by merchant name
    - Return with spending total

14. getReceiptsByCategory(req, res)
    - Filter by category
    - Return with total spending

15. getReceiptsByDateRange(req, res)
    - Filter by date range
    - Return receipts

// Transaction Integration
16. createTransactionFromReceipt(req, res)
    - Create expense transaction
    - Link transaction to receipt
    - Return transaction object

17. linkTransaction(req, res)
    - Link existing transaction
    - Update receipt transactionId
    - Return confirmation

18. unlinkTransaction(req, res)
    - Remove transaction link
    - Return confirmation

// Analytics
19. getReceiptStats(req, res)
    - Total receipts count
    - Total spending from receipts
    - Average receipt amount
    - Most frequent merchant
    - Return stats object

20. getTopMerchants(req, res)
    - Group receipts by merchant
    - Sum spending per merchant
    - Sort by total
    - Return top 10

21. getCategoryBreakdown(req, res)
    - Group by category
    - Calculate totals
    - Return breakdown

// Export
22. exportReceipts(req, res)
    - Generate CSV with receipt data
    - Return file

23. downloadReceiptImage(req, res)
    - Get image URL
    - Stream image file
    - Return image
```

### Stage 4C: OCR Integration & Services

#### Service to Create (`backend/Services/ocrService.js`)

```javascript
Required npm Packages:
- tesseract.js (client-side OCR)
- node-tesseract-ocr (server-side)
- sharp (image processing)
- @google-cloud/vision (Google Vision API - optional)

Functions to Implement:

1. preprocessImage(imageBuffer)
   - Resize image if too large
   - Convert to grayscale
   - Enhance contrast
   - Denoise image
   - Deskew if needed
   - Return processed image buffer

2. extractText(imagePath)
   - Call Tesseract OCR
   - Extract raw text
   - Return text and confidence score

3. parseReceiptData(rawText)
   - Identify merchant name (top lines, capitalized)
   - Extract date (regex for date patterns)
   - Extract total amount (look for "Total", "Amount Due")
   - Extract subtotal, tax, tip
   - Extract items (line items with prices)
   - Extract payment method
   - Extract receipt number
   - Return structured object

4. detectCurrency(text)
   - Look for currency symbols (₹, $, €, £)
   - Return currency code

5. extractDate(text)
   - Try multiple date formats
   - Return Date object or null

6. extractAmount(text, keyword)
   - Look for keyword + number pattern
   - Clean number (remove currency symbols)
   - Return number

7. extractMerchantName(text)
   - Get first 1-3 lines
   - Remove numbers and special chars
   - Return cleaned name

8. extractItems(text)
   - Find line items (name + price pattern)
   - Parse quantity if present
   - Return array of item objects

9. categorizeMerchant(merchantName)
   - Match against known patterns
   - Match against keywords
   - Use ML classification (optional)
   - Return suggested category

10. validateExtraction(data)
    - Check required fields present
    - Validate data formats
    - Calculate confidence score
    - Return validation result

11. correctCommonErrors(text)
    - Fix common OCR mistakes (O → 0, l → 1)
    - Fix currency symbols
    - Return corrected text

12. googleVisionOCR(imageUrl)
    - (Optional) Call Google Vision API
    - Extract text and bounding boxes
    - Return structured data
```

#### Service to Create (`backend/Services/receiptProcessingQueue.js`)

```javascript
Required npm Package:
- bull (Redis-based queue)

Setup:
- Create job queue for receipt processing
- Prevent server blocking during OCR
- Retry failed jobs

Functions:
1. addToQueue(receiptId)
   - Add job to processing queue
   - Return job ID

2. processJob(job)
   - Get receipt from database
   - Call OCR service
   - Update receipt with results
   - Mark as complete or failed

3. retryJob(jobId)
   - Retry failed job
   - Track retry count
```

### Stage 4D: Frontend Components

#### Components to Create

**1. Receipts Dashboard** (`frontend/src/pages/Receipts.jsx`)
```javascript
Sections:
- Upload button (prominent with drag-drop area)
- Tabs: All | Unverified | Verified
- Receipts grid (or list view toggle)
- Each receipt card shows:
  * Thumbnail image
  * Merchant name
  * Date
  * Amount
  * Category badge
  * Verification status icon
  * Quick actions (View, Edit, Delete)
- Search bar
- Filters (by category, date range, verified status)
- Sort options (date, amount, merchant)
- Summary cards:
  * Total receipts
  * Total spending from receipts
  * Unverified count
- Analytics button
```

**2. Upload Receipt Component** (`frontend/src/components/receipts/UploadReceipt.jsx`)
```javascript
Features:
- Drag and drop area
- Click to browse
- Image preview before upload
- Multiple file upload support
- Upload progress indicator
- Cancel upload button
- Supported formats display (JPG, PNG, PDF)
- Max file size display
- Camera capture button (for mobile)

After Upload:
- Show processing status
- Redirect to verification screen
- Show success message with receipt count
```

**3. Receipt Details/Verification Modal** (`frontend/src/components/receipts/ReceiptVerificationModal.jsx`)
```javascript
Layout:
- Left side: Receipt image (large, zoomable)
- Right side: Extracted data form

Editable Fields:
- Merchant name
- Date (date picker)
- Total amount
- Subtotal
- Tax
- Tip
- Discount
- Category (dropdown)
- Payment method
- Receipt number
- Items list (editable table)
- Notes (textarea)
- Tags (multi-select)

Features:
- Highlight low-confidence fields
- OCR confidence score display
- Edit mode toggle
- Save corrections button
- Create transaction button
- Link to existing transaction
- Mark as verified button
- Delete receipt button
- Download original image button
- Rotate image buttons

Visual Indicators:
- ✓ Verified fields (green)
- ⚠ Low confidence fields (yellow/red)
- ✎ Edited fields (blue)
```

**4. Receipt Image Viewer** (`frontend/src/components/receipts/ImageViewer.jsx`)
```javascript
Features:
- Full-screen modal
- Zoom in/out controls
- Pan image (click and drag)
- Rotate image (90° increments)
- Reset view button
- Download button
- Close button
- Keyboard shortcuts (ESC to close, +/- to zoom)
```

**5. Receipt Items Editor** (`frontend/src/components/receipts/ItemsEditor.jsx`)
```javascript
Table Columns:
- Item Name | Qty | Unit Price | Total | Actions

Features:
- Add item button
- Inline editing
- Delete item
- Auto-calculate totals
- Reorder items (drag and drop)
- Detect duplicates
- Clear all button
```

**6. Receipt Search** (`frontend/src/components/receipts/ReceiptSearch.jsx`)
```javascript
Search Options:
- Text search (merchant, notes, items)
- Category filter (multi-select dropdown)
- Date range picker
- Amount range (min/max)
- Verification status filter
- Has transaction filter

Features:
- Real-time search
- Clear filters button
- Save search button (create preset)
- Export results button
```

**7. Receipt Analytics Page** (`frontend/src/pages/ReceiptAnalytics.jsx`)
```javascript
Sections:
- Summary cards:
  * Total receipts
  * Total spending
  * Average receipt amount
  * Most visited merchant
- Charts:
  * Spending by category (pie chart)
  * Spending over time (line/bar chart)
  * Top 10 merchants (horizontal bar chart)
  * Average by category
- Tables:
  * Recent receipts
  * Frequent merchants
  * Largest receipts
- Date range selector
- Export analytics button
```

**8. Receipt Merchant Profile** (`frontend/src/components/receipts/MerchantProfile.jsx`)
```javascript
Display:
- Merchant name (header)
- Total visits
- Total spending
- Average receipt amount
- First visit date
- Last visit date
- All receipts timeline
- Spending trend chart
- Category distribution
```

**9. Bulk Receipt Actions** (`frontend/src/components/receipts/BulkActions.jsx`)
```javascript
Features:
- Select multiple receipts (checkboxes)
- Select all button
- Bulk actions dropdown:
  * Verify selected
  * Delete selected
  * Change category
  * Create transactions
  * Export selected
  * Tag selected
- Selected count display
- Clear selection button
```

**10. Receipt Summary Widget** (`frontend/src/components/dashboard/ReceiptWidget.jsx`)
```javascript
Display:
- Unverified receipts count (red badge if > 0)
- Recent receipts (last 5, thumbnails)
- Quick upload button
- Total receipts this month
- Total spending this month
- View all link
```

**11. OCR Confidence Indicator** (`frontend/src/components/receipts/ConfidenceIndicator.jsx`)
```javascript
Display:
- Confidence percentage (0-100%)
- Color-coded badge:
  * Green: 90-100% (Excellent)
  * Yellow: 70-89% (Good - verify)
  * Orange: 50-69% (Fair - check carefully)
  * Red: <50% (Poor - manual entry recommended)
- Icon indicator
- Tooltip with explanation
```

### Stage 4E: Integration & Testing

#### Integration Points
1. **With Transactions**: Auto-create expense from verified receipt
2. **With Budget**: Receipt spending counts toward budget
3. **With Categories**: Use transaction categories for receipts
4. **With Tax**: Link receipts as proof for deductions
5. **With Notifications**: Notify when unverified receipts accumulate

#### File Storage Setup
**Options:**
1. **AWS S3**: Scalable cloud storage
   - Configure AWS credentials
   - Create S3 bucket
   - Setup public/private access
   
2. **Cloudinary**: Image optimization and CDN
   - Setup account
   - Configure API keys
   - Auto-generate thumbnails

3. **Local Storage**: For development
   - Create uploads directory
   - Setup static file serving
   - Implement cleanup job

#### OCR Engine Selection
**Options:**
1. **Tesseract.js** (Free, open-source)
   - Pros: Free, works offline, decent accuracy
   - Cons: Slower, requires preprocessing

2. **Google Cloud Vision API** (Paid)
   - Pros: High accuracy, fast, supports handwriting
   - Cons: Requires API key, costs money

3. **AWS Textract** (Paid)
   - Pros: Excellent for receipts, extracts structured data
   - Cons: More expensive

**Recommendation**: Start with Tesseract.js, upgrade to Google Vision once proven.

#### Testing Checklist
- [ ] Image upload works for JPG, PNG, PDF
- [ ] File size validation works
- [ ] Drag-and-drop works
- [ ] Mobile camera capture works
- [ ] OCR extracts text correctly
- [ ] Merchant name detected correctly
- [ ] Date parsing handles various formats
- [ ] Amount extraction accurate
- [ ] Item list extraction works
- [ ] Category auto-suggestion accurate
- [ ] Image preprocessing improves accuracy
- [ ] Verification saves corrections
- [ ] Transaction creation works
- [ ] Search functionality works
- [ ] Analytics calculations correct
- [ ] Export works
- [ ] Bulk actions work
- [ ] Mobile responsive

### Stage 4F: Polish & Optimization

#### Enhancements
1. **ML Model Training**: Train custom model on user's receipts for better accuracy
2. **Real-time OCR**: Process on client-side for instant feedback
3. **Batch Upload**: Upload multiple receipts at once
4. **Email Integration**: Forward receipt emails to auto-process
5. **Duplicate Detection**: Warn if same receipt uploaded twice
6. **Smart Categorization**: Learn from user's corrections
7. **Receipt Templates**: Pre-fill common merchants
8. **Expense Reports**: Generate reports from receipts
9. **Mileage Tracking**: For vehicle-related receipts
10. **Multi-language Support**: OCR for non-English receipts
11. **Warranty Tracking**: Track warranty expiry from receipts
12. **Return/Refund Tracking**: Mark receipts for returns
13. **Business Expense Separation**: Flag receipts as business expenses
14. **Receipt Backup**: Auto-backup to cloud
15. **Social Features**: Share receipts (for splitting bills)

---

## Feature 5: Advanced Analytics Dashboard

### Overview
Comprehensive data visualization and predictive analytics dashboard with machine learning insights.

### Stage 5A: Database Schema Design

#### Models to Create

**1. AnalyticsDashboard Model** (`backend/models/AnalyticsDashboard.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- dashboardName: String (default: "My Dashboard")
- widgets: Array [{
    widgetId: String (unique ID),
    widgetType: String (e.g., "spending_chart", "budget_progress"),
    position: Object { x: Number, y: Number, w: Number, h: Number },
    config: Object (widget-specific settings),
    dataSource: String (API endpoint or query),
    refreshInterval: Number (minutes, null = manual),
    isVisible: Boolean (default: true),
    createdAt: Date
  }]
- layout: String (enum: ["grid", "masonry", "custom"], default: "grid")
- theme: String (enum: ["light", "dark"], default: "light")
- isDefault: Boolean (default: true)
- createdAt: Date
- updatedAt: Date
```

**2. AnalyticsMetric Model** (`backend/models/AnalyticsMetric.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- metricName: String (required, e.g., "spending_rate", "savings_rate")
- metricCategory: String (enum: ["financial_health", "spending", "income", "savings", "debt", "goals"])
- currentValue: Number (required)
- previousValue: Number (for comparison)
- change: Object {
    amount: Number,
    percentage: Number,
    trend: String (enum: ["up", "down", "stable"])
  }
- timestamp: Date (required)
- period: String (enum: ["daily", "weekly", "monthly", "yearly"])
- metadata: Object (additional context)
- createdAt: Date
```

**3. AnalyticsInsight Model** (`backend/models/AnalyticsInsight.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- insightType: String (enum: [
    "spending_pattern",
    "anomaly_detection",
    "opportunity",
    "warning",
    "achievement",
    "prediction",
    "recommendation"
  ], required)
- title: String (required, e.g., "Unusual Spending Detected")
- description: String (required)
- severity: String (enum: ["info", "low", "medium", "high"], default: "info")
- category: String (e.g., "Food", "Transportation")
- value: Number (optional, amount or percentage)
- data: Object (supporting data)
- actionable: Boolean (default: false)
- actionText: String (optional, e.g., "Review Budget")
- actionLink: String (optional, URL to relevant page)
- isRead: Boolean (default: false)
- isDismissed: Boolean (default: false)
- generatedAt: Date (required)
- expiresAt: Date (optional, for time-sensitive insights)
- confidence: Number (0-100, ML model confidence)
- createdAt: Date
```

**4. SpendingPattern Model** (`backend/models/SpendingPattern.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- patternType: String (enum: [
    "recurring",
    "seasonal",
    "day_of_week",
    "time_of_day",
    "category_correlation",
    "merchant_preference"
  ], required)
- category: String (optional)
- description: String (required)
- frequency: String (e.g., "Every Monday", "Monthly")
- averageAmount: Number
- confidenceScore: Number (0-100)
- detectedAt: Date
- supporting Data: Object {
    occurrences: Array [{
      date: Date,
      amount: Number
    }],
    statistics: Object
  }
- isActive: Boolean (default: true)
- createdAt: Date
- updatedAt: Date
```

**5. AnomalyDetection Model** (`backend/models/AnomalyDetection.js`)
```javascript
Schema Fields:
- userId: ObjectId (ref: User, required)
- anomalyType: String (enum: [
    "unusual_spending",
    "unusual_income",
    "large_transaction",
    "frequency_spike",
    "category_shift",
    "merchant_new"
  ], required)
- transactionId: ObjectId (ref: Transaction, optional)
- detectedValue: Number (the unusual value)
- expectedValue: Number (based on pattern)
- deviation: Number (percentage or amount)
- category: String
- date: Date
- description: String
- algorithmUsed: String (e.g., "z_score", "isolation_forest")
- confidenceScore: Number (0-100)
- isReviewed: Boolean (default: false)
- userFeedback: String (enum: ["correct", "false_positive", "ignore"])
- createdAt: Date
```

#### Indexes to Create
- AnalyticsDashboard: `{ userId: 1, isDefault: 1 }`
- AnalyticsMetric: `{ userId: 1, metricName: 1, timestamp: -1 }`
- AnalyticsInsight: `{ userId: 1, isRead: 1, generatedAt: -1 }`
- SpendingPattern: `{ userId: 1, isActive: 1 }`
- AnomalyDetection: `{ userId: 1, isReviewed: 1, date: -1 }`

### Stage 5B: Backend API Development

#### Routes to Create (`backend/routes/analyticsRoutes.js`)

```javascript
Endpoints:

// Dashboard Management
GET    /api/analytics/dashboard             - Get user's dashboard config
POST   /api/analytics/dashboard             - Create custom dashboard
PUT    /api/analytics/dashboard/:id         - Update dashboard
DELETE /api/analytics/dashboard/:id         - Delete dashboard
POST   /api/analytics/dashboard/widget      - Add widget
PUT    /api/analytics/dashboard/widget/:id  - Update widget config
DELETE /api/analytics/dashboard/widget/:id  - Remove widget

// Metrics
GET    /api/analytics/metrics               - Get all current metrics
GET    /api/analytics/metrics/:metric       - Get specific metric history
POST   /api/analytics/metrics/calculate     - Calculate and store metrics

// Insights
GET    /api/analytics/insights              - Get all insights
GET    /api/analytics/insights/unread       - Get unread insights
POST   /api/analytics/insights/:id/read     - Mark insight as read
POST   /api/analytics/insights/:id/dismiss  - Dismiss insight
GET    /api/analytics/insights/generate     - Generate new insights

// Patterns
GET    /api/analytics/patterns              - Get spending patterns
GET    /api/analytics/patterns/:id          - Get pattern details
GET    /api/analytics/patterns/detect       - Detect new patterns

// Anomalies
GET    /api/analytics/anomalies             - Get detected anomalies
GET    /api/analytics/anomalies/unreviewed  - Get unreviewed anomalies
POST   /api/analytics/anomalies/:id/review  - Review anomaly
POST   /api/analytics/anomalies/detect      - Detect anomalies

// Visualizations (Data Endpoints for Charts)
GET    /api/analytics/charts/spending-trend          - Time series data
GET    /api/analytics/charts/category-breakdown      - Pie chart data
GET    /api/analytics/charts/income-vs-expense       - Comparison data
GET    /api/analytics/charts/cashflow                - Cash flow over time
GET    /api/analytics/charts/budget-vs-actual        - Budget comparison
GET    /api/analytics/charts/net-worth-trend         - Net worth timeline
GET    /api/analytics/charts/savings-rate            - Savings rate history
GET    /api/analytics/charts/category-trends         - Category trends
GET    /api/analytics/charts/heatmap                 - Spending heatmap

// Predictions
GET    /api/analytics/predictions/spending  - Predict future spending
GET    /api/analytics/predictions/income    - Predict future income
GET    /api/analytics/predictions/cashflow  - Predict cash flow
GET    /api/analytics/predictions/goal      - Predict goal achievement

// Reports
POST   /api/analytics/reports/generate      - Generate custom report
GET    /api/analytics/reports/:id           - Get report
POST   /api/analytics/reports/:id/export    - Export report (PDF/CSV)

// Comparisons
GET    /api/analytics/compare/periods       - Compare time periods
GET    /api/analytics/compare/categories    - Compare category performance
GET    /api/analytics/compare/budgets       - Compare budget vs actual

// Advanced Analytics
GET    /api/analytics/correlation           - Find spending correlations
GET    /api/analytics/what-if               - What-if scenario analysis
GET    /api/analytics/optimization          - Budget optimization suggestions
GET    /api/analytics/efficiency            - Spending efficiency metrics
```

#### Controllers to Create (`backend/controllers/analyticsController.js`)

```javascript
Functions to Implement (40+ functions):

// Dashboard Management (6)
1. getDashboard(req, res)
2. createDashboard(req, res)
3. updateDashboard(req, res)
4. deleteDashboard(req, res)
5. addWidget(req, res)
6. updateWidget(req, res)
7. removeWidget(req, res)

// Metrics (5)
8. getAllMetrics(req, res)
9. getMetricHistory(req, res)
10. calculateMetrics(req, res)
11. compareMetrics(req, res)
12. exportMetrics(req, res)

// Insights (6)
13. getAllInsights(req, res)
14. getUnreadInsights(req, res)
15. markInsightAsRead(req, res)
16. dismissInsight(req, res)
17. generateInsights(req, res)
18. getInsightsByType(req, res)

// Patterns (4)
19. getSpendingPatterns(req, res)
20. getPatternDetails(req, res)
21. detectPatterns(req, res)
22. deactivatePattern(req, res)

// Anomalies (4)
23. getAnomalies(req, res)
24. getUnreviewedAnomalies(req, res)
25. reviewAnomaly(req, res)
26. detectAnomalies(req, res)

// Chart Data (9)
27. getSpendingTrendData(req, res)
28. getCategoryBreakdownData(req, res)
29. getIncomeVsExpenseData(req, res)
30. getCashflowData(req, res)
31. getBudgetVsActualData(req, res)
32. getNetWorthTrendData(req, res)
33. getSavingsRateData(req, res)
34. getCategoryTrendsData(req, res)
35. getHeatmapData(req, res)

// Predictions (4)
36. predictSpending(req, res)
37. predictIncome(req, res)
38. predictCashflow(req, res)
39. predictGoalAchievement(req, res)

// Reports (3)
40. generateReport(req, res)
41. getReport(req, res)
42. exportReport(req, res)

// Comparisons (3)
43. comparePeriods(req, res)
44. compareCategories(req, res)
45. compareBudgets(req, res)

// Advanced (4)
46. findCorrelations(req, res)
47. whatIfAnalysis(req, res)
48. optimizeBudget(req, res)
49. calculateEfficiency(req, res)
```

### Stage 5C: Analytics Services & Algorithms

#### Service to Create (`backend/Services/analyticsCalculationService.js`)

```javascript
Required npm Packages:
- simple-statistics (statistical functions)
- regression (regression analysis)
- ml-regression (machine learning regressions)

Core Functions to Implement:

// Financial Metrics
1. calculateSpendingRate(income, expenses)
2. calculateSavingsRate(income, savings)
3. calculateRunRate(recentExpenses)
4. calculateCashRunway(balance, runRate)
5. calculateDebtToIncomeRatio(debt, income)
6. calculateEmergencyFundRatio(savings, monthlyExpenses)
7. calculateFinancialVelocity(netWorthChange, time)

// Statistical Analysis
8. calculateMean(values)
9. calculateMedian(values)
10. calculateStandardDeviation(values)
11. calculatePercentile(values, percentile)
12. detectOutliers(values, threshold)
13. calculateTrend(timeSeries)
14. calculateMovingAverage(values, window)
15. calculateGrowthRate(oldValue, newValue)

// Pattern Detection
16. detectRecurringPattern(transactions)
17. detectSeasonalPattern(transactions)
18. detectDayOfWeekPattern(transactions)
19. detectCategoryCorrelation(transactions)
20. identifySpendingSpikes(transactions)

// Anomaly Detection
21. zScoreAnomalyDetection(value, mean, stdDev)
22. iqrAnomalyDetection(value, q1, q3)
23. movingAverageAnomaly(value, historicalValues)
24. isolationForestAnomaly(dataPoints) // ML-based

// Predictions (Time Series)
25. linearRegression (x, y)
26. polynomialRegression(x, y, degree)
27. exponentialSmoothing(values, alpha)
28. simpleMovingAveragePredict(values, periods)
29. arimaForecast(timeSeries, periods) // Complex

// Insights Generation
30. generateSpendingInsights(transactions)
31. generateSavingsOpportunities(budget, spending)
32. generateBudgetWarnings(budget, actual)
33. identifyUnusualMerchants(transactions)
34. suggestBudgetAdjustments(historical, current)

// Optimization
35. optimizeBudgetAllocation(income, categories, priorities)
36. suggestablAllocation(totalAmount, goals)
37. maxim izeSavings(income, fixedExpenses, variableExpenses)

// Correlations
38. calculatePearsonCorrelation(x, y)
39. findSpendingCorrelations(categoryData)
40. identifyInfluencingFactors(spending, variables)
```

#### Service to Create (`backend/Services/insightGeneratorService.js`)

```javascript
Functions to Implement:

// Spending Insights
1. generateSpendingPatternInsight(patterns)
   - "You typically spend more on weekends"
   - "Your food expenses peak on Fridays"

2. generateCategoryTrendInsight(categoryTrends)
   - "Transportation costs up 25% this month"
   - "Entertainment spending decreased"

3. generateLargeTransactionInsight(transactions)
   - "You had 3 transactions over $100 this week"

4. generateFrequentMerchantInsight(merchants)
   - "You visited Starbucks 12 times this month"

// Savings/Opportunities
5. generateSavingsOpportunity(budget, spending)
   - "You could save $200 by reducing dining out"
   - "Your unused 80C limit: ₹50,000 - save ₹15,600"

6. generateUnusedBudgetInsight(budget, spending)
   - "You have $150 left in your shopping budget"

7. generateGoalProgressInsight(goals)
   - "You're ahead on your vacation goal!"
   - "Emergency fund 75% complete"

// Warnings
8. generateBudgetExceededWarning(budget, actual)
   - "You've exceeded your food budget by 20%"

9. generateOverspendingWarning(trend)
   - "Your spending increased 30% this month"

10. generateLowBalanceWarning(balance, projectedExpenses)
    - "You may run out of money in 2 weeks"

// Achievements
11. generateSavingsAchievement(milestone)
    - "Congratulations! You saved $1,000"

12. generateConsistencyAchievement(streak)
    - "10-day streak of staying under budget!"

// Predictions
13. generateOverBudgetPrediction(currentSpending, daysRemaining)
    - "At current rate, you'll exceed budget by $150"

14. generateGoalTimelinePredict(goal, savingsRate)
    - "You'll reach your goal in 8 months"

// Anomalies
15. generateAnomalyAlert(anomaly)
    - "Unusual spending detected: $500 on category X"

// Recommendations
16. generateBudgetRecommendation(analysis)
    - "Consider increasing your savings budget"

17. generateDebtPayoffStrategy(loans)
    - "Pay off Credit Card #1 first to save on interest"

// Priority & Severity
18. calculateInsightPriority(insight)
    - High: Budget exceeded, low balance
    - Medium: Opportunity to save
    - Low: Interesting pattern

19. determineInsightExpiry(insightType)
    - Budget warnings: end of month
    - Opportunities: 30 days
    - Patterns: don't expire
```

### Stage 5D: Frontend  Components

#### Components to Create

**1. Advanced Analytics Dashboard** (`frontend/src/pages/AdvancedAnalytics.jsx`)
```javascript
Layout:
- Customizable grid layout (drag-and-drop widgets)
- Widget library sidebar
- Dashboard settings menu
- Export dashboard button
- Share dashboard button (future)

Features:
- Add widget button Opens widget selector
- Drag widgets to reorder
- Resize widgets
- Remove widgets
- Refresh all data button
- Auto-refresh toggle
- Date range selector (global filter)
- Comparison period selector
- Full-screen mode

Pre-built Widgets:
1. Financial Health Score Card
2. Spending Trend Line Chart
3. Category Breakdown Pie Chart
4. Income vs Expense Bar Chart
5. Budget Progress Bars
6. Net Worth Timeline
7. Savings Rate Gauge
8. Recent Insights Feed
9. Anomaly Alerts
10. Goal Progress Cards
11. Cash Flow Waterfall
12. Spending Heatmap
13. Top Merchants Table
14. Category Trends
15. Predictions Panel
```

**2. Widget Library Modal** (`frontend/src/components/analytics/WidgetLibrary.jsx`)
```javascript
Categories:
- Overview Widgets
- Charts & Graphs
- KPIs & Metrics
- Insights & Alerts
- Comparisons
- Predictions

Each Widget Preview Shows:
- Small preview image
- Widget name
- Description
- Add button

Features:
- Search widgets
- Filter by category
- Most used widgets highlighted
```

**3. Insights Feed** (`frontend/src/components/analytics/InsightsFeed.jsx`)
```javascript
Features:
- Real-time insights stream
- Insights grouped by type
- Color-coded by severity
- Each insight card shows:
  * Icon based on type
  * Title
  * Description
  * Value/Amount (if applicable)
  * Action button (if actionable)
  * Dismiss button
  * Mark as read button
- Filter by type, severity
- Sort by date, severity
- "View all" link
```

**4. Spending Heatmap** (`frontend/src/components/analytics/SpendingHeatmap.jsx`)
```javascript
Display:
- Calendar heatmap (like GitHub contributions)
- Each day colored by spending amount
- Color scale: Light (low spending) to Dark (high spending)
- Hover shows: Date, Amount, Transactions count
- Click day to see details
- Month/Year navigation
- Category filter (show heatmap for specific category)
- Export as image
```

**5. Interactive Charts Library**

**Line Chart Component** (`LineChart.jsx`)
```javascript
Features:
- Multiple series support
- Zoom and pan
- Crosshair with tooltip
- Legend with toggle
- Export as image/SVG
- Responsive
Props:
- data, xAxis, yAxis, series, colors
```

**Bar Chart Component** (`BarChart.jsx`)
```javascript
Features:
- Horizontal/Vertical
- Grouped/Stacked bars
- Hover tooltips
- Click to drill-down
- Export
Props:
- data, categories, series, stacked, horizontal
```

**Pie/Donut Chart** (`PieChart.jsx`)
```javascript
Features:
- Animated segments
- Click to explode
- Legends
- Center label (for donut)
- Export
Props:
- data, labels, colors, donut, centerText
```

**6. Anomaly Detection Dashboard** (`frontend/src/pages/AnomalyDetection.jsx`)
```javascript
Sections:
- Summary cards:
  * Anomalies detected
  * Unreviewed count
  * False positives
  * Total deviation amount
- Anomalies list (cards or table)
- Each anomaly shows:
  * Date and transaction
  * Detected value vs Expected value
  * Deviation percentage
  * Category
  * Confidence score
  * Review status
  * Actions (Review, Dismiss, View transaction)
- Filters (by type, date, reviewed status)
- Detection settings button
```

**7. Spending Patterns Viewer** (`frontend/src/pages/SpendingPatterns.jsx`)
```javascript
Display:
- Pattern cards grouped by type
- Recurring Patterns:
  * Shows frequency
  * Shows next expected occurrence
  * Shows average amount
- Seasonal Patterns:
  * Shows months/seasons
  * Shows peak periods
- Day of Week Patterns:
  * Shows bar chart of spending by day
- Category Correlations:
  * Shows related categories
  * "When you spend on X, you also spend on Y"
- Each pattern card has:
  * Confidence indicator
  * Supporting data chart
  * "Use for budgeting" button
```

**8. Predictions Dashboard** (`frontend/src/pages/Predictions.jsx`)
```javascript
Sections:
- Spending Predictions:
  * Next month forecast
  * Category-wise predictions
  * Confidence intervals
  * Comparison with actual (if past)
- Income Predictions:
  * Expected income next month
  * Based on historical patterns
- Cash Flow Predictions:
  * Expected balance over next 3/6 months
  * Scenario analysis (best/worst/likely)
- Goal Achievement Predictions:
  * Probability of reaching goals on time
  * Recommended adjustments
- Prediction accuracy tracker
- Model performance metrics
```

**9. Comparison Tool** (`frontend/src/components/analytics/ComparisonTool.jsx`)
```javascript
Features:
- Select comparison type:
  * This Month vs Last Month
  * This Year vs Last Year
  * Q1 vs Q2 vs Q3 vs Q4
  * Custom date ranges
  * Budget vs Actual
- Metrics to compare:
  * Total income
  * Total expenses
  * Savings
  * Category spending
  * Financial health score
- Visual comparison:
  * Side-by-side cards
  * Change percentages
  * Up/down indicators
  * Bar charts
- Export comparison report
```

**10. What-If Analyzer** (`frontend/src/components/analytics/WhatIfAnalyzer.jsx`)
```javascript
Scenarios:
- "What if I reduce category X by Y%?"
- "What if my income increases by Z?"
- "What if I pay off debt early?"
- "What if I save $X more per month?"

Interface:
- Scenario builder (sliders and inputs)
- Current state display
- Projected state display
- Impact visualization (charts)
- Key differences highlighted
- Save scenario button
- Compare multiple scenarios

Outputs:
- New budget allocation
- Projected savings
- Time to goal
- Financial health impact
```

**11. Customizable Reports Builder** (`frontend/src/components/analytics/ReportBuilder.jsx`)
```javascript
Features:
- Report template selector:
  * Monthly Summary
  * Annual Review
  * Tax Report
  * Category Analysis
  * Net Worth Statement
  * Custom Report
- Report sections builder:
  * Drag sections to include
  * Reorder sections
  * Configure each section
- Data filters:
  * Date range
  * Categories
  * Accounts
  * Tags
- Export options:
  * PDF (formatted)
  * CSV (raw data)
  * Excel (with charts)
  * Email report
- Schedule reports (weekly/monthly/annually)
- Save report templates
```

**12. Correlation Explorer** (`frontend/src/components/analytics/CorrelationExplorer.jsx`)
```javascript
Display:
- Correlation matrix (heatmap)
- Positive correlations (green)
- Negative correlations (red)
- Examples:
  * "When food spending increases, entertainment decreases"
  * "High transportation correlated with work season"
- Scatter plots for selected pairs
- Strength indicator (weak/moderate/strong)
- Actionable insights based on correlations
```

**13. Financial Efficiency Metrics** (`frontend/src/components/analytics/EfficiencyMetrics.jsx`)
```javascript
Metrics Displayed:
- Spending Efficiency: (Essential / Total) ratio
- Savings Efficiency: Savings rate vs peers
- Budget Adherence: % within budget
- Goal Efficiency: Goals achieved / set
- Debt Efficiency: Payoff progress
- Investment Efficiency: Returns vs benchmarks

Features:
- Gauge charts for each metric
- Historical trend lines
- Comparison with targets
- Improvement suggestions
- Drill-down for each metric
```

### Stage 5E: Machine Learning Integration

#### ML Models to Implement (Optional - Advanced)

**1. Spending Prediction Model**
```
Model Type: Time Series Forecasting (ARIMA, LSTM)
Input: Historical spending data
Output: Predicted spending for next period
Training: Monthly on user data
Accuracy Target: 85%+
```

**2. Anomaly Detection Model**
```
Model Type: Isolation Forest, Autoencoders
Input: Transaction features (amount, category, merchant, time)
Output: Anomaly score
Training: Unsupervised learning on user's normal behavior
```

**3. Category Classification Model**
```
Model Type: Naive Bayes, Random Forest
Input: Transaction description, merchant, amount
Output: Suggested category
Training: On labeled transaction data
```

**4. Financial Health Scoring Model**
```
Model Type: Gradient Boosting (XGBoost)
Input: Multiple financial metrics
Output: Health score 0-100
Training: On anonymized user data
```

**5. Recommendation System**
```
Model Type: Collaborative Filtering
Input: User spending patterns, similar users
Output: Personalized recommendations
Training: On aggregate user data
```

#### Implementation Strategy
1. **Phase 1**: Rule-based algorithms (statistical methods)
2. **Phase 2**: Pre-trained models (TensorFlow.js)
3. **Phase 3**: Custom ML models (Python backend)
4. **Phase 4**: Real-time learning (model updates)

### Stage 5F: Testing & Optimization

#### Performance Optimization
1. **Data Caching**: Redis cache for expensive calculations
2. **Lazy Loading**: Load widgets on demand
3. **Data Aggregation**: Pre-aggregate common queries
4. **Background Jobs**: Calculate metrics in background
5. **Indexing**: Optimize database queries
6. **Pagination**: Large datasets paginated
7. **Debouncing**: Avoid excessive API calls
8. **Web Workers**: Offload calculations to workers

#### Testing Checklist
- [ ] Dashboard loads under 2 seconds
- [ ] Widgets refresh correctly
- [ ] Drag-and-drop works smoothly
- [ ] Charts render accurately
- [ ] Insights generate correctly
- [ ] Anomaly detection catches unusual spending
- [ ] Patterns detected accurately
- [ ] Predictions reasonably accurate
- [ ] Comparison calculations correct
- [ ] Reports export successfully
- [ ] What-if analysis calculates correctly
- [ ] Mobile responsive
- [ ] Works offline (cached data)
- [ ] Real-time updates work
- [ ] No memory leaks
- [ ] Handles large datasets

#### Polish & Enhancements
1. **Dashboard Templates**: Pre-built templates for different users
2. **Sharing**: Share dashboard views
3. **Alerts**: Custom alerts based on metrics
4. **Voice Insights**: Audio summaries
5. **Scheduled Reports**: Auto-generate and email
6. **Mobile App**: Native analytics app
7. **Real-time Collaboration**: Family dashboard
8. **AI Narration**: Natural language summaries
9. **Benchmark Comparison**: Compare with anonymized peers
10. **Gamification**: Achievements for financial behavior

---

## Implementation Timeline

### Phase Planning (Estimated 16-20 Weeks)

**Weeks 1-4: Feature 1 - Loan & EMI Calculator**
- Week 1: Database models + API routes
- Week 2: Controllers + calculation service
- Week 3: Frontend components
- Week 4: Testing + polish

**Weeks 5-8: Feature 2 - Net Worth Tracking**
- Week 5: Database models + API routes
- Week 6: Controllers + calculation service
- Week 7: Frontend components + charts
- Week 8: Testing + polish + automation

**Weeks 9-11: Feature 3 - Tax Planning Module**
- Week 9: Database models + API routes + controllers
- Week 10: Tax calculation service + frontend forms
- Week 11: Tax calculator + reports + testing

**Weeks 12-15: Feature 4 - Receipt OCR & Management**
- Week 12: Database models + file storage setup
- Week 13: OCR integration + parsing service
- Week 14: Frontend upload + verification components
- Week 15: Testing + optimization + batch processing

**Weeks 16-20: Feature 5 - Advanced Analytics Dashboard**
- Week 16: Database models + API routes
- Week 17: Analytics services + algorithms
- Week 18: Dashboard framework + widgets (part 1)
- Week 19: Widgets (part 2) + charts + insights
- Week 20: Testing + optimization + ML integration

---

## Testing Strategy

### Unit Testing
- **Backend**: Jest for all controllers, services, models
- **Frontend**: Vitest for components, utilities
- **Coverage Target**: 80%+

### Integration Testing
- **API Testing**: Postman collections for all endpoints
- **Database Testing**: Test data integrity and queries
- **Service Integration**: Test interactions between features

### End-to-End Testing
- **User Flows**: Test complete workflows
- **Tools**: Cypress or Playwright
- **Critical Paths**:
  * Create loan → Record payment → View schedule
  * Add asset → Update value → View net worth
  * Upload receipt → Verify → Create transaction
  * Generate tax report → Export PDF
  * Create custom dashboard → Add widgets → View insights

### Performance Testing
- **Load Testing**: Concurrent users
- **Stress Testing**: Large datasets
- **Tools**: Artillery, k6
- **Benchmarks**:
  * API response < 500ms
  * Dashboard load < 2s
  * ML predictions < 3s

### Security Testing
- **Authentication**: JWT validation
- **Authorization**: Role-based access
- **Input Validation**: Prevent injection attacks
- **File Upload**: Validate file types and sizes
- **Data Encryption**: Sensitive data encrypted
- **API Rate Limiting**: Prevent abuse

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] File storage configured
- [ ] API keys secured
- [ ] Error logging setup
- [ ] Performance monitoring ready
- [ ] Backup strategy in place

### Deployment Steps
1. **Database Migration**: Run migrations for new models
2. **File Storage**: Setup S3/Cloudinary
3. **Environment Config**: Update .env files
4. **Backend Deploy**: Deploy API server
5. **Frontend Build**: Build and deploy frontend
6. **Verification**: Test all features in production
7. **Monitoring**: Setup alerts and logs
8. **Documentation**: Update user guides

### Post-Deployment
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on usage patterns
- [ ] Schedule regular backups
- [ ] Plan next iteration

---

## Success Metrics

### Feature Adoption
- % of users using each feature
- Feature usage frequency
- User retention impact

### Performance Metrics
- Page load times
- API response times
- Error rates
- Uptime percentage

### Business Metrics
- User satisfaction (NPS)
- Feature completion rates
- Time spent in app
- Premium conversion (if applicable)

### Research Metrics
- ML model accuracy
- OCR accuracy rate
- Prediction accuracy
- Anomaly detection precision/recall

---

## Conclusion

This comprehensive implementation guide provides a clear, stage-by-stage roadmap for adding five high-priority advanced features to the Smart Financial Tracker system. Each feature is broken down into manageable tasks with clear deliverables, timelines, and success criteria.

The features build upon each other and integrate seamlessly with the existing system while introducing cutting-edge technologies like OCR, machine learning, and advanced data visualization.

**Next Steps:**
1. Review and approve this implementation plan
2. Setup development environment for Stage 1
3. Create project tracking board with all tasks
4. Assign priorities and begin Feature 1 implementation
5. Regular progress reviews every 2 weeks
6. Iterate and adjust plan based on learnings

---

**Document Version:** 1.0  
**Created:** February 18, 2026  
**Author:** Development Team  
**Status:** Ready for Implementation

**Note:** Do not add any code to the project yet. This document serves as the complete specification and planning guide. Implementation will begin only after approval.
