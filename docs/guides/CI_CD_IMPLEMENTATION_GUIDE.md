# CI/CD Pipeline & Unit Testing Implementation Guide

## 📋 System Architecture Overview

### Current Tech Stack
```
Frontend:
├── Framework: React 19.2.0
├── Build Tool: Vite 7.2.4
├── Styling: TailwindCSS 3.4.17
├── Router: React Router DOM 7.12.0
├── Charts: Recharts 3.6.0
└── Linting: ESLint 9.39.1

Backend:
├── Runtime: Node.js (ES Modules)
├── Framework: Express 5.2.1
├── Database: MongoDB (Mongoose 9.1.1)
├── Authentication: JWT (jsonwebtoken 9.0.3)
├── Password: bcryptjs 3.0.3
└── Email: Nodemailer 7.0.12

Repository Structure:
├── /frontend (React + Vite)
├── /backend (Node.js + Express)
└── Root monorepo configuration
```

---

## 🎯 Implementation Roadmap

### Stage 1: Testing Infrastructure Setup
- **Duration:** 2-3 days
- **Priority:** High
- Setup testing frameworks for frontend and backend
- Configure test utilities and mocks
- Write initial test suites

### Stage 2: CI Pipeline Configuration
- **Duration:** 1-2 days
- **Priority:** High
- Setup GitHub Actions workflows
- Configure automated testing on PR
- Setup linting and code quality checks

### Stage 3: CD Pipeline Configuration
- **Duration:** 2-3 days
- **Priority:** Medium
- Setup deployment automation
- Configure environment-specific builds
- Implement deployment strategies

### Stage 4: Monitoring & Optimization
- **Duration:** Ongoing
- **Priority:** Medium
- Setup test coverage reporting
- Implement performance monitoring
- Continuous optimization

---

## 📦 Stage 1: Testing Infrastructure Setup

### 1.1 Frontend Testing Setup (Vitest + React Testing Library)

#### Install Dependencies
```bash
cd frontend
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### Create Vitest Configuration
**File:** `frontend/vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/main.jsx',
        'dist/'
      ],
      threshold: {
        branches: 70,
        functions: 70,
        lines: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### Create Test Setup File
**File:** `frontend/src/test/setup.js`
```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key) => localStorageMock[key] || null,
  setItem: (key, value) => { localStorageMock[key] = value; },
  removeItem: (key) => { delete localStorageMock[key]; },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key];
      }
    });
  }
};
global.localStorage = localStorageMock;
```

#### Create Test Utilities
**File:** `frontend/src/test/utils.jsx`
```javascript
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export function renderWithProviders(ui, options = {}) {
  const {
    initialUserState = null,
    initialTheme = 'light',
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <UserProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
```

#### Update Frontend package.json
Add test scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### Sample Frontend Test Files

**File:** `frontend/src/components/__tests__/TransactionItem.test.jsx`
```javascript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../test/utils';
import TransactionItem from '../TransactionItem';

describe('TransactionItem', () => {
  const mockTransaction = {
    _id: '123',
    description: 'Grocery Shopping',
    amount: 50.00,
    type: 'expense',
    category: 'Food',
    date: '2024-02-10T00:00:00.000Z'
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders transaction details correctly', () => {
    renderWithProviders(
      <TransactionItem transaction={mockTransaction} {...mockHandlers} />
    );

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText(/50\.00/)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TransactionItem transaction={mockTransaction} {...mockHandlers} />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('123');
  });
});
```

**File:** `frontend/src/utils/__tests__/formatCurrency.test.js`
```javascript
import { describe, it, expect } from 'vitest';

// Assuming you have a currency formatter utility
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toContain('1,000.00');
  });
});
```

### 1.2 Backend Testing Setup (Jest + Supertest)

#### Install Dependencies
```bash
cd backend
npm install -D jest supertest @jest/globals mongodb-memory-server
```

#### Create Jest Configuration
**File:** `backend/jest.config.js`
```javascript
export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/test/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

#### Create Test Setup File
**File:** `backend/test/setup.js`
```javascript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
```

#### Create Test Utilities
**File:** `backend/test/utils.js`
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function createTestUser(userData = {}) {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...userData
  };
  
  const user = await User.create(defaultUser);
  return user;
}

export function generateTestToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

export async function createAuthenticatedUser() {
  const user = await createTestUser();
  const token = generateTestToken(user._id);
  return { user, token };
}
```

#### Update Backend package.json
Add test scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  }
}
```

#### Sample Backend Test Files

**File:** `backend/controllers/__tests__/transactionController.test.js`
```javascript
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import transactionRoutes from '../../routes/transactionRoutes.js';
import { createAuthenticatedUser } from '../../test/utils.js';
import Transaction from '../../models/Transaction.js';

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

describe('Transaction Controller', () => {
  let authUser, token;

  beforeEach(async () => {
    const auth = await createAuthenticatedUser();
    authUser = auth.user;
    token = auth.token;
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        description: 'Test Transaction',
        amount: 100,
        type: 'expense',
        category: 'Food',
        date: new Date()
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.description).toBe('Test Transaction');
      expect(response.body.amount).toBe(100);
    });

    it('should reject transaction without authentication', async () => {
      const transactionData = {
        description: 'Test Transaction',
        amount: 100,
        type: 'expense'
      };

      await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(401);
    });
  });

  describe('GET /api/transactions', () => {
    it('should return user transactions', async () => {
      await Transaction.create({
        userId: authUser._id,
        description: 'Test 1',
        amount: 100,
        type: 'expense',
        category: 'Food'
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });
});
```

**File:** `backend/middleware/__tests__/authMiddleware.test.js`
```javascript
import { jest } from '@jest/globals';
import { requireAuth } from '../requireAuth.js';
import { generateTestToken } from '../../test/utils.js';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should authenticate valid token', () => {
    const token = generateTestToken('user123');
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user123');
  });

  it('should reject missing token', () => {
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

## 🔄 Stage 2: CI Pipeline Configuration

### 2.1 GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'

jobs:
  # Frontend Testing & Build
  frontend:
    name: Frontend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Run Tests
        run: npm run test:coverage

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

      - name: Build Application
        run: npm run build

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist
          retention-days: 7

  # Backend Testing & Validation
  backend:
    name: Backend CI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand({ ping: 1 })'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test:coverage
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test-secret-key
          NODE_ENV: test

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage/lcov.info
          flags: backend
          name: backend-coverage

      - name: Validate Server Syntax
        run: node --check server.js

  # Security & Code Quality
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run npm audit (Frontend)
        working-directory: ./frontend
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run npm audit (Backend)
        working-directory: ./backend
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

### 2.2 Pull Request Workflow

**File:** `.github/workflows/pr-checks.yml`
```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-validation:
    name: PR Validation
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Validate PR Title
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Check for merge conflicts
        run: |
          git fetch origin ${{ github.base_ref }}
          git merge-base --is-ancestor origin/${{ github.base_ref }} HEAD || exit 1

      - name: Comment PR Size
        uses: actions/github-script@v7
        with:
          script: |
            const additions = context.payload.pull_request.additions;
            const deletions = context.payload.pull_request.deletions;
            const total = additions + deletions;
            
            let size = 'small';
            let emoji = '✅';
            if (total > 1000) {
              size = 'very large';
              emoji = '⚠️';
            } else if (total > 500) {
              size = 'large';
              emoji = '⚠️';
            } else if (total > 200) {
              size = 'medium';
              emoji = '📝';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `${emoji} This PR is **${size}** (${additions} additions, ${deletions} deletions)`
            });
```

---

## 🚀 Stage 3: CD Pipeline Configuration

### 3.1 Deployment Workflow (Example: Vercel for Frontend, Render for Backend)

**File:** `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20.x'

jobs:
  test-before-deploy:
    name: Pre-Deployment Tests
    uses: ./.github/workflows/ci.yml

  deploy-frontend:
    name: Deploy Frontend
    needs: test-before-deploy
    runs-on: ubuntu-latest
    environment:
      name: production-frontend
      url: https://your-app.vercel.app

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'

  deploy-backend:
    name: Deploy Backend
    needs: test-before-deploy
    runs-on: ubuntu-latest
    environment:
      name: production-backend
      url: https://your-api.onrender.com

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}

      - name: Wait for Deployment
        run: sleep 60

      - name: Health Check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.BACKEND_URL }}/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed with status $response"
            exit 1
          fi
          echo "Health check passed"
```

### 3.2 Environment-Specific Deployments

**File:** `.github/workflows/deploy-staging.yml`
```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

env:
  NODE_VERSION: '20.x'

jobs:
  deploy-staging-frontend:
    name: Deploy Frontend to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging-frontend

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build for Staging
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          alias-domains: staging.your-app.vercel.app

  deploy-staging-backend:
    name: Deploy Backend to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging-backend

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          # Your staging deployment logic here
          echo "Deploying to staging environment"
```

---

## 📊 Stage 4: Monitoring & Optimization

### 4.1 Test Coverage Reporting

**File:** `.github/workflows/coverage-report.yml`
```yaml
name: Coverage Report

on:
  pull_request:
    branches: [main, develop]

jobs:
  coverage:
    name: Generate Coverage Report
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run Frontend Tests
        working-directory: ./frontend
        run: npm run test:coverage

      - name: Run Backend Tests
        working-directory: ./backend
        run: npm run test:coverage

      - name: Comment Coverage on PR
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: |
            ./frontend/coverage/lcov.info
            ./backend/coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 4.2 Performance Monitoring

**File:** `.github/workflows/performance.yml`
```yaml
name: Performance Audit

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Install Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:4173
          uploadArtifacts: true
          temporaryPublicStorage: true
          runs: 3
```

---

## 🛠️ Additional Configuration Files

### Environment Variables Setup

**File:** `.env.example` (Update both frontend and backend)

**Frontend (.env.example):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Smart Financial Tracker
VITE_ENABLE_ANALYTICS=false
```

**Backend (.env.example):**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart_financial_tracker

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Docker Support (Optional)

**File:** `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**File:** `backend/Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

**File:** `docker-compose.yml` (Root directory)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: sft-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: smart_financial_tracker

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sft-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/smart_financial_tracker
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sft-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

---

## 📝 Pre-Commit Hooks (Optional but Recommended)

### Install Husky and lint-staged

```bash
# At root directory
npm init -y
npm install -D husky lint-staged
npx husky init
```

**File:** `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**File:** `package.json` (Root)
```json
{
  "name": "smart-financial-tracker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "prepare": "husky install",
    "test:all": "npm run test --prefix frontend && npm run test --prefix backend"
  },
  "lint-staged": {
    "frontend/**/*.{js,jsx}": [
      "cd frontend && npm run lint --fix",
      "cd frontend && npm run test:run --related"
    ],
    "backend/**/*.js": [
      "cd backend && npm run test:run --related"
    ]
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

---

## 🎯 Execution Checklist

### Phase 1: Setup (Week 1)
- [ ] Install all testing dependencies (frontend & backend)
- [ ] Create test configuration files
- [ ] Set up test utilities and helpers
- [ ] Write initial test suites for critical components
- [ ] Achieve minimum 50% code coverage
- [ ] Update package.json scripts

### Phase 2: CI Configuration (Week 2)
- [ ] Create `.github/workflows` directory
- [ ] Set up CI workflow for automated testing
- [ ] Configure PR checks workflow
- [ ] Set up code coverage reporting
- [ ] Test workflows with dummy PRs
- [ ] Configure branch protection rules

### Phase 3: CD Configuration (Week 3)
- [ ] Choose deployment platforms
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Configure deployment workflows
- [ ] Set up environment variables in GitHub Secrets
- [ ] Test deployment pipeline
- [ ] Configure rollback procedures

### Phase 4: Monitoring (Week 4)
- [ ] Set up coverage reporting
- [ ] Configure performance monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure deployment notifications
- [ ] Document deployment procedures
- [ ] Train team on CI/CD processes

---

## 🔐 GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
# Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key

# Environment
JWT_SECRET=your-production-jwt-secret
MONGODB_URI=your-production-mongodb-uri
STAGING_API_URL=https://staging-api.your-domain.com
BACKEND_URL=https://api.your-domain.com

# Notifications (Optional)
SLACK_WEBHOOK_URL=your-slack-webhook
DISCORD_WEBHOOK_URL=your-discord-webhook
```

---

## 📚 Best Practices

1. **Test Coverage**
   - Maintain minimum 80% coverage for critical paths
   - Write tests before fixing bugs (TDD approach)
   - Test edge cases and error scenarios

2. **CI/CD Pipeline**
   - Fail fast - run quick tests first
   - Cache dependencies to speed up builds
   - Use matrix testing for multiple Node versions if needed

3. **Code Quality**
   - Enforce linting on all commits
   - Use semantic commit messages
   - Require PR reviews before merging

4. **Security**
   - Never commit secrets or API keys
   - Run security audits regularly
   - Keep dependencies up to date

5. **Deployment**
   - Use staging environment for testing
   - Implement blue-green deployment for zero downtime
   - Have rollback procedures ready
   - Monitor application after deployment

---

## 🚨 Troubleshooting

### Common Issues

**Frontend tests failing with "Cannot find module"**
```bash
# Ensure vitest.config.js has correct resolve aliases
# Check that imports use correct extensions
```

**Backend tests timeout**
```bash
# Increase Jest timeout in jest.config.js
# Check MongoDB Memory Server is starting correctly
```

**CI workflow failing on GitHub Actions**
```bash
# Check all secrets are configured
# Verify Node version matches local development
# Review workflow logs for specific errors
```

**Coverage not uploading to Codecov**
```bash
# Ensure CODECOV_TOKEN is set in GitHub Secrets
# Check coverage files are generated correctly
# Verify file paths in workflow
```

---

## 📖 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)

---

## 🎓 Next Steps After Implementation

1. Integrate Continuous Performance Monitoring
2. Set up automated dependency updates (Dependabot)
3. Implement E2E testing with Playwright/Cypress
4. Add visual regression testing
5. Set up feature flags for gradual rollouts
6. Configure A/B testing infrastructure

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Maintained By:** Development Team
