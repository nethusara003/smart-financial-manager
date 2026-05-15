# AI-Powered Retirement Planning System

## Overview

This feature introduces a four-layer retirement planning pipeline:

1. Deterministic financial engine
2. Machine learning income/expense predictions
3. Monte Carlo probabilistic simulation
4. LLM-powered advisory output

The planner now defaults to minimal user input.
It auto-derives current savings and average monthly savings from existing wallet + transaction history.

## Backend Endpoints

Base path: `/api/retirement`

### 1) Calculate deterministic projection

POST `/api/retirement/calculate`

Request body:

```json
{
  "age": 30,
  "retirementAge": 60,
  "targetAmount": 1200000
}
```

Optional advanced fields:
- `returnRate`
- `applyGrowthAdjustments`
- `inflationRate`
- `salaryGrowthRate`
- `currentSavings` / `monthlySavings` (manual override only)

### 2) Run Monte Carlo simulation and persist plan

POST `/api/retirement/simulate`

Request body:

```json
{
  "currentSavings": 25000,
  "monthlySavings": 500,
  "age": 30,
  "retirementAge": 60,
  "targetAmount": 1200000,
  "returnRate": 8,
  "inflationRate": 3,
  "salaryGrowthRate": 4
}
```

### 3) Generate AI advice

POST `/api/retirement/advise`

Request body:

```json
{
  "currentSavings": 25000,
  "monthlySavings": 500,
  "age": 30,
  "retirementAge": 60,
  "targetAmount": 1200000,
  "returnRate": 8,
  "inflationRate": 3,
  "salaryGrowthRate": 4
}
```

## Database Schema

Collection: `retirementplans`

```json
{
  "userId": "ObjectId",
  "projectedFund": 0,
  "probability": 0,
  "scenarios": [],
  "createdAt": "2026-04-22T00:00:00.000Z"
}
```

## Environment Variables

Add these in `backend/.env`:

```dotenv
RETIREMENT_RETURN_RATE=0.08
RETIREMENT_INFLATION_RATE=0.03
RETIREMENT_SALARY_GROWTH_RATE=0.04
RETIREMENT_MC_SIMULATIONS=1000
RETIREMENT_RETURN_MEAN=0.08
RETIREMENT_RETURN_STD_DEV=0.03
RETIREMENT_INCOME_VARIATION=0.10
RETIREMENT_EXPENSE_VARIATION=0.08
RETIREMENT_ML_SERVICE_URL=http://127.0.0.1:5055
RETIREMENT_ML_TIMEOUT_MS=1200
RETIREMENT_HISTORY_MONTHS=24
RETIREMENT_PROFILE_MONTHS_WINDOW=6
RETIREMENT_REQUIRE_ML=false
```

`RETIREMENT_REQUIRE_ML=true` enforces ML-only predictions and disables fallback heuristics.

## ML Service Setup

1. Install Python dependencies:

```bash
cd ml-service
pip install -r requirements.txt
```

2. Train models:

```bash
python train_model.py
```

This generates:
- `ml-service/model_expense.pkl`
- `ml-service/model_income.pkl`

3. Start ML API:

```bash
python app.py
```

Default endpoint: `http://127.0.0.1:5055/predict`

## Frontend Setup

From repository root:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Open route: `/retirement`

## Test Coverage

Backend deterministic + simulation smoke test (validated):

```bash
npm --prefix backend run test:retirement:smoke
```

Optional Jest suite (requires mongodb-memory-server binary download availability):

```bash
npm --prefix backend test -- modules/retirement/__tests__/retirement.engine.test.js
```
