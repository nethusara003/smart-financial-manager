# Smart Financial Tracker - Complete System Documentation (A to Z)

Version: repository snapshot as of 2026-04-28
Scope: end-to-end technical documentation for architecture, workflows, APIs, data models, runtime, DevOps, and operations.

---

## 1. System Overview

Smart Financial Tracker is a full-stack personal finance platform with:

- Multi-role authentication (user, admin, super_admin, guest)
- Transaction tracking (income/expense)
- Budgeting and adaptive budget analysis
- Goals and recurring transactions
- Bills and reminders
- Notifications and weekly reporting
- AI assistant (chat + conversation management)
- P2P transfers and wallet ledgering
- Loans, EMI analytics, amortization, prepayments
- Retirement planning with deterministic forecast, Monte Carlo simulation, AI advisory, and saved plan refresh
- Feedback and financial health/forecasting modules

Primary stack:

- Frontend: React 19, Vite 7, React Router 7, React Query, Tailwind
- Backend: Node.js, Express 5, JWT auth, Mongoose 9
- Database: MongoDB
- Infra: Vercel (frontend), Render (backend), Docker support, GitHub Actions CI/CD

---

## 2. High-Level Architecture

```text
Browser (React SPA)
  -> /api/* HTTP requests (Bearer JWT for protected calls)
  -> Backend Express API
  -> Mongoose models/services/controllers
  -> MongoDB collections

Separate worker process:
  -> scheduled jobs (budget checks, reminders, cleanup, weekly reports)
```

Backend runtime entrypoints:

- API process: `backend/server.js`
- Worker process: `backend/worker.js`
- App factory and route mount: `backend/app.js`

Frontend runtime entrypoints:

- Boot: `frontend/src/main.jsx`
- Router + auth/session behavior: `frontend/src/App.jsx`
- API client: `frontend/src/services/apiClient.js`

Recent core additions in this snapshot:

- New retirement planning backend module mounted at `/api/retirement`
- New frontend retirement planner experience at `/retirement`, integrated through the unified Forecast & Retirement hub
- Persistent retirement plans via `RetirementPlan` model with save/list/refresh workflows
- Backend test-environment hardening in Jest setup to tolerate MongoMemoryServer checksum/lock failures by falling back to `MONGODB_URI_TEST` or local MongoDB

---

## 3. Repository Structure and Responsibilities

Top-level workspaces:

- `backend/`: Express app, controllers, services, models, middleware, scripts, tests
- `frontend/`: React SPA, pages/components/hooks/contexts, tests
- `tests/e2e/`: Playwright E2E specs
- `.github/workflows/`: CI/CD and operational pipelines
- `scripts/`: deployment smoke script

Backend key folders:

- `controllers/`: HTTP handlers
- `routes/`: endpoint declarations and middleware binding
- `models/`: Mongoose schemas
- `modules/retirement/`: retirement domain module (routes/controller/service/simulation/ML integration)
- `middleware/`: auth, authorization, request context, error handling
- `Services/`: domain services (AI, forecasting, notifications, wallet, ledger, loans)
- `utils/`: schedulers, context helpers, logging, support utilities

Frontend key folders:

- `src/pages/`: route-level screens
- `src/components/`: reusable UI and domain components
- `src/features/retirement/`: retirement form, result visualization, and advisory panels
- `src/hooks/`: feature hooks (transfers, wallet, notifications, etc.)
- `src/context/` and `src/contexts/`: app-level state providers
- `src/services/`: request abstraction
- `src/lib/queryClient.js`: React Query client

---

## 4. Request Lifecycle (Backend)

Sequence in `backend/app.js`:

1. CORS gate validates origin against `FRONTEND_URL` list and project-specific Vercel pattern.
2. JSON/urlencoded body parsers (50mb limits).
3. Request context middleware injects `requestId` and response header `x-request-id`.
4. Request logger writes latency/status/actor metadata.
5. Route handlers execute.
6. Unknown route -> 404 via `notFound`.
7. Central `errorHandler` returns standardized error envelope.

Error envelope for middleware-managed errors:

```json
{
  "success": false,
  "error": {
    "message": "...",
    "statusCode": 500,
    "requestId": "..."
  }
}
```

Note: some auth failures return plain shape from `requireAuth`, e.g. `{ "message": "No token provided", "requestId": "..." }`.

---

## 5. Authentication and Authorization

Auth middleware:

- `requireAuth` in `backend/middleware/requireAuth.js`
- Extracts Bearer token from `Authorization`
- Verifies JWT using `JWT_SECRET`
- Supports guest payloads (`role: guest`) and regular users

Role middleware:

- `requireAdmin`: allows `admin` and `super_admin`
- Additional super-admin checks exist in other middleware files for sensitive operations

Roles in system:

- `user`: normal app access
- `admin`: admin dashboards and management endpoints
- `super_admin`: elevated admin authority
- `guest`: limited guest flow token

Session behavior (frontend):

- Auth state persisted in storage with scope key/versioning
- Session inactivity auto-logout uses configurable timeout from privacy settings
- Cross-tab sync via storage events and logout propagation

---

## 6. Complete API Inventory (A to Z)

Base:

- `GET /health` -> service health metadata
- `GET /` -> plain API running message

Legend:

- Public = no `requireAuth`
- Auth = requires JWT Bearer
- Admin = requires `requireAuth` + `requireAdmin`

### 6.1 User APIs (`/api/users`)

- `POST /api/users/register` (Public) - register user
- `POST /api/users/login` (Public) - login
- `POST /api/users/login/2fa/verify` (Public) - verify login 2FA code
- `POST /api/users/guest-login` (Public) - guest token/session login
- `POST /api/users/forgot-password` (Public) - reset initiation
- `POST /api/users/reset-password` (Public) - reset completion
- `GET /api/users/profile` (Auth) - current profile
- `POST /api/users/update-currency` (Auth) - currency preference update
- `PUT /api/users/budget-settings` (Auth) - salary/savings/budget config
- `POST /api/users/change-password` (Auth) - password change
- `PUT /api/users/profile` (Auth) - profile updates
- `PUT /api/users/notification-settings` (Auth) - notification preferences
- `PUT /api/users/privacy-settings` (Auth) - privacy/session preferences
- `GET /api/users/export-data` (Auth) - user data export
- `POST /api/users/delete-account` (Auth) - account deletion
- `POST /api/users/trigger-weekly-report` (Auth) - manual weekly report trigger
- `POST /api/users/set-transfer-pin` (Auth) - transfer PIN setup
- `GET /api/users/check-transfer-pin` (Auth) - transfer PIN status/check

### 6.2 Transactions APIs (`/api/transactions`)

- `POST /api/transactions` (Auth) - create transaction
- `GET /api/transactions` (Auth) - list user transactions
- `PUT /api/transactions/:id` (Auth) - update transaction
- `DELETE /api/transactions/:id` (Auth) - delete transaction

### 6.3 Admin APIs (`/api/admin`)

- `POST /api/admin/invite` (Admin) - invite admin
- `POST /api/admin/accept-invite` (Public) - accept invite token
- `GET /api/admin/users` (Admin) - list users
- `PATCH /api/admin/promote/:userId` (Admin) - promote role
- `PATCH /api/admin/demote/:userId` (Admin) - demote role
- `GET /api/admin/users/:userId/transactions` (Admin) - target user transactions
- `GET /api/admin/transactions` (Admin) - all transactions
- `GET /api/admin/analytics/overview` (Admin) - admin analytics
- `GET /api/admin/audit-logs` (Admin) - admin role change logs

Also mounted separately:

- `GET /api/admin/analytics/overview` (Admin) via `adminAnalyticsRoutes`

### 6.4 AI Assistant APIs (`/api/ai`)

- `POST /api/ai/chat` (Auth) - ask assistant
- `POST /api/ai/conversations/new` (Auth) - create conversation
- `GET /api/ai/conversations` (Auth) - list conversations
- `GET /api/ai/conversations/:conversationId` (Auth) - conversation history
- `DELETE /api/ai/conversations/:conversationId` (Auth) - delete conversation
- `GET /api/ai/suggestions` (Auth) - contextual suggested prompts
- `POST /api/ai/feedback` (Auth) - chat feedback signal

### 6.5 Goals APIs (`/api/goals`)

- `GET /api/goals` (Auth) - list goals
- `POST /api/goals` (Auth) - create goal
- `PUT /api/goals/:id` (Auth) - update goal
- `DELETE /api/goals/:id` (Auth) - delete goal
- `PUT /api/goals/:id/contribute` (Auth) - add contribution

### 6.6 Bills APIs (`/api/bills`)

- `GET /api/bills` (Auth) - list bills
- `GET /api/bills/upcoming` (Auth) - upcoming bills
- `POST /api/bills` (Auth) - create bill
- `PUT /api/bills/:id` (Auth) - update bill
- `DELETE /api/bills/:id` (Auth) - delete bill
- `PATCH /api/bills/:id/mark-paid` (Auth) - mark paid

### 6.7 Budgets APIs (`/api/budgets`)

- `GET /api/budgets` (Auth) - list budgets
- `GET /api/budgets/with-spending` (Auth) - budgets with computed spend
- `GET /api/budgets/smart-analyze` (Auth) - category analysis
- `GET /api/budgets/status` (Auth) - adaptive status
- `GET /api/budgets/analysis` (Auth) - adaptive detailed analysis
- `POST /api/budgets` (Auth) - create budget
- `POST /api/budgets/smart-generate` (Auth) - smart budget generation
- `POST /api/budgets/generate-from-income` (Auth) - budget generation from salary config
- `PUT /api/budgets/:id` (Auth) - update budget
- `DELETE /api/budgets/:id` (Auth) - delete budget

### 6.8 Notifications APIs (`/api/notifications`)

- `GET /api/notifications` (Auth) - list notifications
- `PATCH /api/notifications/:id/read` (Auth) - mark one read
- `PATCH /api/notifications/read-all` (Auth) - mark all read
- `DELETE /api/notifications/:id` (Auth) - delete one
- `DELETE /api/notifications` (Auth) - clear all

### 6.9 Recurring APIs (`/api/recurring`)

- `GET /api/recurring` (Auth) - list recurring transactions
- `POST /api/recurring` (Auth) - create recurring transaction
- `PUT /api/recurring/:id` (Auth) - update recurring transaction
- `DELETE /api/recurring/:id` (Auth) - delete recurring transaction
- `PATCH /api/recurring/:id/toggle` (Auth) - toggle active state

### 6.10 Recommendation APIs (`/api/recommendations`)

- `GET /api/recommendations/budget` (Auth) - AI budget recommendation output

### 6.11 Financial Health APIs (`/api/financial-health`)

- `GET /api/financial-health/score` (Auth) - current score
- `GET /api/financial-health/history` (Auth) - score history

### 6.12 Forecasting APIs (`/api/forecasting`)

- `GET /api/forecasting/expenses` (Auth) - expense forecast
- `GET /api/forecasting/category/:category` (Auth) - per-category forecast

### 6.13 Feedback APIs (`/api/feedback`)

- `POST /api/feedback` (Auth) - create feedback
- `GET /api/feedback` (Auth) - list approved/filtered feedback
- `GET /api/feedback/my-feedbacks` (Auth) - current user feedback
- `PUT /api/feedback/:id` (Auth) - update feedback
- `DELETE /api/feedback/:id` (Auth) - delete feedback
- `POST /api/feedback/:id/helpful` (Auth) - mark helpful

### 6.14 Transfer APIs (`/api/transfers`)

- `GET /api/transfers/search-users` (Auth) - user discovery
- `GET /api/transfers/contacts` (Auth) - saved recipients
- `POST /api/transfers/validate-receiver` (Auth) - receiver validation
- `POST /api/transfers/send-otp` (Auth) - transfer OTP dispatch
- `GET /api/transfers/my-limits` (Auth) - transfer limits summary
- `POST /api/transfers/check-feasibility` (Auth) - pre-check transfer feasibility
- `POST /api/transfers/initiate` (Auth) - create transfer intent
- `GET /api/transfers/my-transfers` (Auth) - transfer history
- `GET /api/transfers/:transferId` (Auth) - transfer detail
- `POST /api/transfers/:transferId/process` (Auth) - process transfer
- `POST /api/transfers/:transferId/cancel` (Auth) - cancel transfer
- `POST /api/transfers/:transferId/reverse` (Auth) - reverse transfer

### 6.15 Wallet APIs (`/api/wallet`)

- `GET /api/wallet/balance` (Auth) - wallet snapshot
- `POST /api/wallet/initialize` (Auth) - initialize wallet record
- `POST /api/wallet/add-funds` (Auth) - wallet credit
- `POST /api/wallet/withdraw` (Auth) - wallet debit
- `GET /api/wallet/transactions` (Auth) - wallet ledger/history

### 6.16 Loan APIs (`/api/loans`)

- `POST /api/loans` (Auth) - create loan
- `GET /api/loans` (Auth) - list loans
- `GET /api/loans/:id` (Auth) - loan detail
- `PUT /api/loans/:id` (Auth) - update loan
- `DELETE /api/loans/:id` (Auth) - close/delete loan
- `POST /api/loans/calculate-emi` (Auth) - ad hoc EMI calculation
- `GET /api/loans/:id/amortization` (Auth) - amortization schedule
- `POST /api/loans/:id/payments` (Auth) - record payment
- `GET /api/loans/:id/payments` (Auth) - payment history
- `POST /api/loans/:id/simulate-extra-payment` (Auth) - extra payment simulation
- `GET /api/loans/:id/early-payoff` (Auth) - early payoff amount
- `POST /api/loans/:id/prepayment` (Auth) - apply prepayment
- `GET /api/loans/analytics/summary` (Auth) - loan analytics summary
- `GET /api/loans/analytics/overdue` (Auth) - overdue loans
- `POST /api/loans/compare` (Auth) - compare loan offers

### 6.17 Retirement APIs (`/api/retirement`)

- `POST /api/retirement/calculate` (Auth) - deterministic retirement projection
- `POST /api/retirement/simulate` (Auth) - Monte Carlo retirement simulation
- `POST /api/retirement/advise` (Auth) - AI retirement guidance using projection/simulation context
- `GET /api/retirement/plans` (Auth) - list saved retirement plans
- `POST /api/retirement/plans` (Auth) - save a retirement plan snapshot
- `POST /api/retirement/plans/:planId/refresh` (Auth) - recalculate/refresh a saved plan with latest data

Retirement endpoint access behavior:

- Route is protected by `requireAuth`
- Guest sessions are explicitly blocked with 403 responses

### 6.18 Direct Chat API (`/api/chat`)

- `POST /api/chat` (Public route-level; controller performs user resolution/auth gating behavior)

### 6.19 Test/Debug APIs (`/api/test`) - non-production only

Enabled only when `NODE_ENV !== production`.

- `POST /api/test/test-email` (Admin)
- `GET /api/test/notification-settings` (Admin)
- `POST /api/test/reset-budget-alerts` (Admin)

### 6.20 Unmounted Routes

`backend/routes/sampleDataRoutes.js` exists with:

- `POST /generate`
- `GET /check`

but this router is not mounted in `backend/app.js` in current snapshot.

---

## 7. Frontend Application Flow

Boot composition in `frontend/src/main.jsx`:

- React Query provider
- Theme provider
- Toast provider
- Currency provider
- User provider
- Chat provider

Host canonicalization:

- In production, if running on project-specific Vercel alias, app redirects to canonical `VITE_APP_URL`.

Routing in `frontend/src/App.jsx`:

Public routes:

- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/admin/accept-invite`

Protected app routes:

- `/dashboard`
- `/transactions`
- `/analytics`
- `/budgets`, `/budgets/:planId`
- `/recurring`
- `/reports`
- `/goals`
- `/bills-reminders`, `/bills`, `/reminders`
- `/settings`
- `/help`
- `/components`
- `/financial-health`
- `/forecast`
- `/retirement`
- `/feedback`
- `/transfers`
- `/transfer/:transferId`
- `/wallet`
- `/loans`
- `/loans/:id`
- `/emi-calculator`
- Alias redirects: `/recommendations`, `/loan-comparison`, `/refinancing-calculator`, `/debt-payoff-wizard`

Forecast and retirement UI composition:

- `/forecast` and `/retirement` both render `ForecastPlanningHub`
- Hub provides in-page tab switching between `ExpenseForecast` and `RetirementPlanner`
- `RetirementPlanner` orchestrates a three-step backend workflow: calculate -> simulate -> advise
- Saved-plan controls allow list, save, and refresh actions bound to retirement APIs

Admin protected route:

- `/admin`

Fallback:

- `/` and `*` redirect to `/login`

Session timeout logic:

- Activity events refresh timeout
- Timeout value sourced from user privacy settings (default 30 min)
- Cross-tab logout sync via localStorage keys

API calling model:

- `apiClient.request()` wraps `fetch`
- Automatically attaches Bearer token when available
- Parses JSON/text and normalizes error messages

---

## 8. AI and Chatbot Subsystem

Two API entry patterns exist:

1. `/api/ai/chat` via `aiController.chatWithAssistant` -> delegates to `handleChat`
2. `/api/chat` direct to `handleChat`

Core chat workflow (`backend/controllers/chat.controller.js`):

1. Validate `message`, optional `history/sessionId/conversationId`.
2. Resolve user identity using:
- request body `userId` (first priority)
- `req.user` from auth middleware
- decoded bearer token fallback
3. Short-message lightweight path for greetings/acks.
4. Intent detection from keyword mapping.
5. Load full financial context (`getFullUserContext`): transactions, loans, budgets, goals, wallets, transfers, recurring items, notifications.
6. Build prompt (`buildPrompt`) with intent-specific compact context.
7. Call Groq service (`generateGroqReply`) with:
- prompt truncation guards
- timeout
- usage tracking
- retry with compact prompt on limit errors
8. Persist in-memory session history and cumulative token usage stores.
9. Return reply + updated history + usage + context metadata.

Groq service controls:

- Model: `GROQ_MODEL` default `llama-3.1-8b-instant`
- timeout: 20s
- primary and retry character/token limits configurable via env
- limit-aware fallback message for oversized contexts

Conversation persistence features:

- `Conversation` model stores messages, intent/entities/confidence metadata
- context manager supports start/new conversation, follow-up context hints, suggestions, and pagination retrieval

AI-powered retirement advisory integration:

- Retirement planning module calls `generateAdvice` in `backend/Services/ai.service.js`
- Advisory payload includes projected fund, probability of success, target amount, and simulation percentiles
- Returned advisory is persisted on saved retirement plans and shown in the retirement UI

---

## 9. Background Jobs and Worker Workflows

Worker process (`backend/worker.js`) starts schedulers:

- Guest cleanup: every hour
- Budget checker scheduler: every 30 minutes
- Transaction inactivity reminders: every hour
- Loan reminder scheduler: daily at 9:00
- Bill reminders: checked every minute, fires daily at 9:00
- Weekly reports: checked every minute, fires Sunday at 8:00

Operational note:

- Scheduler times are based on server local timezone unless runtime environment enforces a timezone.

---

## 10. Data Model Reference (MongoDB/Mongoose)

### Identity and Access

- `User`
- Core: `name`, `email` (unique), `password`, `role`
- Preferences: `subscriptionTier`, `currency`, salary and budgeting fields, notification/privacy settings
- Security: reset tokens, 2FA login codes and trusted devices
- Transfers: PIN, transfer settings/limits/stats, OTP profile, saved recipients

- `AdminInvitation`
- `email`, `role`, `tokenHash`, `expiresAt`, `used`, `createdBy`

- `AdminAudit`
- `action` (PROMOTE/DEMOTE), `performedBy`, `targetUser`, `performedByRole`

### Core Finance

- `Transaction`
- `user`, `type` (income/expense), `category`, `amount`, `note`, `date`
- Transfer linkage: `isTransfer`, `transferId`, `transferDirection`
- Scope controls: `scope` (savings/wallet), `systemManaged`

- `Budget`
- `userId`, `category`, `limit`, `period`, `alertThreshold`
- Metadata: icon/color/startDate/active
- Alert state: `lastAlertLevel`, `lastAlertDate`
- Grouping: `budgetGroup`, parent flags, group metadata

- `Goal`
- `user`, `name`, `targetAmount`, `currentAmount`, `targetDate`
- `category`, `priority`, `status`, visual metadata

- `RecurringTransaction`
- `userId`, `name`, `amount`, `type`, `category`, `frequency`, `nextDate`, `active`

- `Bill`
- `userId`, `name`, `amount`, `category`, `dueDate`
- recurrence/reminder/payment state fields

- `MonthlyBudgetSnapshot`
- periodic snapshot for salary/savings/budget/spent/remaining/status and daily/weekly limits

- `Category`
- normalized category taxonomy with essentiality and priority

- `RetirementPlan`
- `userId`, `name`, `sourceInput`, `computedInput`
- outputs: `projectedFund`, `probability`, `scenarios`, `deterministic`, `predictions`, `simulation`, `advice`
- lifecycle fields: `lastRefreshedAt`, `createdAt`
- indexes: `userId`, compound `{ userId, createdAt: -1 }`

### Notifications and Feedback

- `Notification`
- `userId`, `type`, `title`, `message`, data payload, read state, UI metadata

- `Feedback`
- `user`, rating/title/comment/category, premium/verification flags, helpful votes, moderation status

### AI Conversations

- `Conversation`
- `userId`, unique `conversationId`, embedded messages
- session metadata (activity, context hints, topic, preferences)
- summary field

### Wallet and Transfers

- `Wallet`
- unique per user, balance/pending/available balances, status lifecycle, optimistic lock version

- `LedgerEntry`
- immutable financial ledger records with transaction type, amount, balanceAfter
- links to transfer/payment refs, metadata, status, actor/device traces

- `Transfer`
- sender and receiver embedded identity snapshots
- amount/currency/fee/netAmount
- status lifecycle and risk metadata
- references to generated transaction records
- reversal and audit metadata

- `TransferLimit`
- per-user custom/default limits with usage counters, reset timestamps, status/expiry/admin override metadata

### Loans

- `Loan`
- borrower (`userId`), principal/rate/tenure, computed EMI totals, status
- lender and account metadata, remaining balance, next payment controls

- `LoanPayment`
- payment breakdown principal/interest/fees, type/method, late flags
- validation ensures amount consistency

- `AmortizationSchedule`
- one per loan (unique `loanId`), array of schedule rows, paid flags, summary totals, stats helpers

---

## 11. Business Workflows

### 11.1 User Onboarding and Access

1. Register via `/api/users/register`
2. Login via `/api/users/login`
3. Optional 2FA verify via `/api/users/login/2fa/verify`
4. Frontend stores token/user snapshot
5. Protected routes activated via `ProtectedRoute`

### 11.2 Transaction Lifecycle

1. User submits transaction
2. API validates auth and payload
3. Transaction persisted
4. Related services may emit alerts/notifications
5. Dashboard, analytics, budgets, AI context reflect updated data

### 11.3 Budget and Adaptive Analysis

1. User configures salary/savings/budget preferences
2. Budgets created manually or smart-generated
3. Spending tracked against limits
4. Adaptive status/analysis endpoints produce safe/warning/crisis-style insights
5. Notifications triggered when thresholds exceed

### 11.4 Bills and Reminders

1. User creates recurring/non-recurring bills
2. Worker checks due windows and reminder settings
3. Notifications/email reminders sent per user preferences
4. Bill marked paid and recurrence advanced where applicable

### 11.5 Transfers and Wallets

1. Discover/validate recipient
2. OTP/PIN checks based on profile settings
3. Feasibility checks against limits and wallet balance
4. Initiate and process transfer
5. Wallet balances + ledger + transaction/transfer records updated
6. Optional cancellation/reversal within rules

### 11.6 Loan Management

1. Create loan with principal/rate/tenure
2. EMI and amortization generated
3. Payments update remaining balance and schedules
4. Extra payment simulation and prepayment supported
5. Analytics summarize active/overdue obligations

### 11.7 AI Assistant Interaction

1. User sends message
2. System detects lightweight greeting vs intentful query
3. Context assembled from all finance modules
4. Prompt generated and sent to Groq
5. Usage and session history tracked
6. Reply returned with intent/context metadata

### 11.8 Admin Governance

1. Admin or super_admin invites new admin
2. Invite accept flow promotes role
3. Promotions/demotions audited
4. Admin analytics and user transaction oversight available

### 11.9 Retirement Planning Workflow

1. User opens `/retirement` (through `ForecastPlanningHub`)
2. Frontend submits planning input to `/api/retirement/calculate`
3. Frontend requests simulation via `/api/retirement/simulate`
4. Frontend requests advisory via `/api/retirement/advise`
5. User can save generated output through `/api/retirement/plans`
6. Saved plans can be refreshed using `/api/retirement/plans/:planId/refresh`
7. Backend derives missing values from real user finance profile:
- net savings from transaction history scoped to savings logic
- wallet balance from `Wallet`
- average monthly savings over configurable profile window
- ML-derived monthly income/expense predictions converted to yearly planning inputs

---

## 12. Service Layer Summary (Backend `Services/`)

- `groq.service.js`: external AI call wrapper with retries and token/size guardrails
- `context.service.js`: aggregates user financial context for AI
- `promptBuilder.js`: compacts/structures context by intent
- `notificationService.js`: send budget/bill/transaction/weekly/inactivity notifications and emails
- `walletService.js`: wallet operations orchestration
- `ledgerService.js`: immutable ledger write behavior
- `loanCalculationService.js`: EMI/amortization calculations
- `forecastingService.js`: expense forecast calculations
- `financialHealthService.js`: financial health scoring
- `adaptiveBudget.service.js`: adaptive budget status calculations
- `budgetRecommendationService.js`: recommendation logic
- `finance.service.js`, `emailService.js`: support services

Retirement module service set (`backend/modules/retirement/`):

- `retirement.service.js`: deterministic projection pipeline, profile resolution, save/list/refresh orchestration
- `retirement.simulation.js`: Monte Carlo simulation engine and probability distribution
- `retirement.ml.js`: income/expense prediction integration for planning horizon
- `retirement.controller.js`: request validation and response shaping
- `retirement.routes.js`: authenticated retirement endpoints

---

## 13. Testing and Quality Gates

### Local test suites

- Backend Jest tests: unit/integration in `backend/**/__tests__` and `backend/test/*`
- Frontend Vitest tests in `frontend/src/test`
- E2E Playwright tests in `tests/e2e`
- Retirement deterministic + Monte Carlo smoke validation in `backend/test/retirement-engine-smoke.js`

### Root scripts

- `npm run test` -> frontend + backend
- `npm run test:e2e` -> Playwright
- `npm run test:coverage` -> both coverage reports
- `npm run smoke:deploy` / `npm run smoke:prod` -> deployment smoke checks

### Backend scripts

- `npm run smoke:api`
- `npm run sync:prod-to-local:safe`
- `npm run migrate:transactions:scope`
- `npm run test:retirement:smoke`

Test environment resilience behavior:

- `backend/test/setup.js` sets `MONGOMS_SKIP_CHECKSUM=1` for MongoMemoryServer startup attempts
- If MongoMemoryServer fails (for example MD5 mismatch or lockfile failures), tests fall back to `MONGODB_URI_TEST` or `mongodb://localhost:27017/test`
- After each test, all collections are cleared to isolate test state

### Frontend scripts

- `npm run check:no-localhost-api` (API URL hygiene)

---

## 14. CI/CD Workflow Map (GitHub Actions)

### `ci.yml`

- Frontend job: lint, API URL hygiene, tests with coverage, build artifact
- Backend job: tests with coverage, syntax checks, smoke API checks with temporary server
- E2E job: boots backend/frontend, waits on health/login, runs Playwright
- Security job: npm audit + Trivy scan upload

### `predeploy-validation.yml`

Reusable workflow used by deploy pipelines:

- Frontend lint/tests/hygiene
- Backend tests with Mongo service

### `deploy-staging.yml`

- Triggers on `develop` pushes/manual
- Runs predeploy validation
- Deploy frontend to Vercel preview
- Deploy backend to Render staging
- Executes health and smoke checks

### `deploy.yml`

- Production deploy workflow (manual by default)
- Uses predeploy validation
- Deploy frontend (Vercel prod)
- Deploy backend (Render)
- Health + smoke checks

### Other workflows

- `coverage-report.yml`: PR coverage report and comment
- `pr-checks.yml`: semantic PR title, merge-base check, PR size comment
- `performance.yml`: scheduled/on-demand Lighthouse audits

---

## 15. Deployment Topology

### Docker Compose

Services:

- `mongodb` (mongo:7)
- `backend` (API container)
- `worker` (same image, `start:worker` command)
- `frontend` (nginx serving built SPA)

Networks/volumes:

- bridge network `sft-network`
- persistent volume `mongodb_data`

Frontend hosting behavior:

- Nginx config supports SPA history fallback
- long-cache static assets, no-cache `index.html`
- security headers and gzip enabled

Vercel SPA behavior:

- `vercel.json` rewrites all paths to `/index.html`

---

## 16. Environment Variable Reference

### Backend (`backend/.env.example` + code references)

- Server/runtime: `PORT`, `NODE_ENV`
- Database: `MONGO_URI`, `MONGODB_URI`
- Test DB fallback: `MONGODB_URI_TEST`
- Safe sync: `PROD_MONGO_URI`, `SAFE_LOCAL_MONGO_URI`
- Auth: `JWT_SECRET`
- Email SMTP: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- OTP: `OTP_EMAIL_ONLY`, `OTP_DEFAULT_COUNTRY_CODE`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`
- CORS frontend allowlist: `FRONTEND_URL` (comma-separated)
- Admin bootstrap: `SUPER_ADMIN_EMAIL`

AI/chat-specific vars from services:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_PRIMARY_SYSTEM_PROMPT_CHARS`
- `GROQ_PRIMARY_USER_PROMPT_CHARS`
- `GROQ_RETRY_SYSTEM_PROMPT_CHARS`
- `GROQ_RETRY_USER_PROMPT_CHARS`
- `GROQ_PRIMARY_MAX_TOKENS`
- `GROQ_RETRY_MAX_TOKENS`
- `CHAT_CONTEXT_CHAR_LIMIT`

Retirement module vars:

- `RETIREMENT_RETURN_RATE` (default 0.08)
- `RETIREMENT_INFLATION_RATE` (default 0.03)
- `RETIREMENT_SALARY_GROWTH_RATE` (default 0.04)
- `RETIREMENT_PROFILE_MONTHS_WINDOW` (default 6)

Test harness vars:

- `MONGOMS_SKIP_CHECKSUM` (enabled in Jest setup)

### Frontend (`frontend/.env.example`)

- `VITE_API_URL`
- `VITE_APP_URL`
- `VITE_APP_NAME`
- `VITE_ENABLE_ANALYTICS`
- `VITE_ENV`

---

## 17. Operational Notes and Caveats (Current Snapshot)

1. Duplicate admin analytics route path:
- `/api/admin/analytics/overview` is registered from two routers (`adminRoutes` and `adminAnalyticsRoutes`).
- In Express, first matching handler usually resolves response first.

2. Loan route ordering risk:
- In `loanRoutes`, `GET /:id` appears before `GET /analytics/summary` and `GET /analytics/overdue`.
- Depending on handler behavior, `/analytics/*` requests may be captured by `/:id`.

3. Direct `/api/chat` route is not wrapped by `requireAuth` middleware:
- Controller can resolve user from body `userId`, request user, or bearer token.
- This behavior should be reviewed for strict authorization guarantees.

4. Docker/API port alignment check required:
- `server.js` default port is 5000 when `PORT` is not set.
- Dockerfile/compose currently expose/map 3000.
- Ensure `PORT` is set appropriately in containerized runs.

5. `sampleDataRoutes` exists but is not mounted in `app.js`.

6. Mixed route/auth response envelope conventions:
- Some errors use standardized `{ success:false, error:{...} }`
- Auth middleware returns `{ message, requestId }`.

7. Test runtime database behavior:
- Jest setup first attempts MongoMemoryServer for isolated in-memory DB tests.
- When binary checksum/lockfile issues occur, setup falls back to `MONGODB_URI_TEST` or `mongodb://localhost:27017/test`.
- In fallback mode, local MongoDB availability is required for full backend test success.

---

## 18. Build, Run, and Maintenance Commands

From repository root:

- Install all: `npm run install-all`
- Full dev (frontend + backend API): `npm run dev`
- Backend API only: `npm run dev:backend:api`
- Worker only: `npm run dev:backend:worker`
- Frontend only: `npm run dev:frontend`
- Frontend production build: `npm run build:frontend`
- Docker start/stop/build: `npm run docker:up`, `npm run docker:down`, `npm run docker:build`
- Lint frontend: `npm run lint:frontend`
- Retirement smoke: `npm --prefix backend run test:retirement:smoke`
- Smoke checks: `npm run smoke:deploy`, `npm run smoke:prod`

---

## 19. Security Controls Present

- JWT-based auth with role-aware middleware
- Admin-only endpoint protection on privileged operations
- CORS allowlist with explicit origin checks
- Request ID tracing for observability
- Structured error logging with request metadata
- Optional OTP channels and transfer PIN controls
- Immutable wallet ledger entries (update/delete blocked)
- Transfer limits with daily/monthly tracking and reset logic

---

## 20. Recommended Next Documentation Enhancements

If you want this doc to become a true living spec, add:

- Request/response JSON schemas per endpoint
- OpenAPI spec generated from route/controller contracts
- Sequence diagrams per core workflow (login, transfer, loan payment, AI query)
- Failure mode matrix (timeouts, retries, idempotency rules)
- Data retention and archival policy
- Runbook sections for incident response and rollback

---

End of complete A-to-Z documentation.
