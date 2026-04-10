# API Migration Matrix by Domain

## Purpose
Tracks migration from ad hoc network calls to the centralized frontend API client and shared hooks, aligned with PROJECT_REVIEW.md Phase 2 deliverables.

## Status Summary
- Migration status: Complete for active frontend source.
- Hardcoded localhost API URLs in active source: None detected.
- Direct axios usage in active source: None detected.

## Domain Matrix
| Domain | Centralized Path | Status | Evidence |
|---|---|---|---|
| Auth and session | `src/hooks/useAuth.js`, `src/context/UserContext.jsx` | Complete | Login/register/forgot/reset/profile load use shared request helpers |
| Transactions | `src/hooks/useTransactions.js` | Complete | Transactions page and form migrated to React Query hooks |
| Dashboard | `src/pages/Dashboard.jsx` + shared hooks | Complete | Uses shared transaction, bills, and wallet hooks |
| Bills and reminders | `src/hooks/useBills.js` | Complete | List/create/update/delete/mark-paid via shared hooks |
| Notifications | `src/hooks/useNotifications.js` | Complete | Notification center + unread counters on shared hooks |
| Transfers | `src/hooks/useTransfers.js` | Complete | Limits/history/details/initiate/cancel/reverse via shared hooks |
| Wallet | `src/hooks/useWallet.js` | Complete | Balance/transactions/add/withdraw via shared hooks |
| Admin dashboard | `src/hooks/useAdminDashboard.js` | Complete | Users, analytics, audits, promote/demote migrated |
| Feedback | `src/hooks/useFeedback.js` | Complete | CRUD and helpful vote on shared hooks |
| Insights and forecasting UI | `src/hooks/useInsights.js` | Complete | Forecast/health/recommendations use shared hooks |
| Budget tools | `src/hooks/useBudgets.js`, `src/hooks/useBudgetTools.js` | Complete | Budget and generator flows migrated |
| Chatbot transport | `src/services/chatbotApi.js` + `apiClient` | Complete | Shared request transport used |

## Guardrails
- API base URL is environment-driven in `frontend/src/services/apiClient.js` using `VITE_API_URL`.
- CI policy enforces localhost hygiene in `.github/workflows/ci.yml` via `npm run check:no-localhost-api`.

## Verification Commands
```bash
cd frontend
npm run lint
npm run check:no-localhost-api
npm run test:run
```
