# Shared Data Hook Guidelines

## Purpose
Defines conventions for React Query usage, polling behavior, and cache invalidation, aligned with PROJECT_REVIEW.md Phase 3.3.

## Baseline
- Query provider and defaults are centralized in:
  - `frontend/src/main.jsx`
  - `frontend/src/lib/queryClient.js`
- Query key conventions are centralized in `frontend/src/hooks/queryKeys.js`.

## Hook Design Rules
1. Co-locate feature hooks in `frontend/src/hooks`.
2. Keep query keys deterministic and namespaced by feature.
3. Use shared transport (`request`/`fetchWithAuth`) from `apiClient`.
4. Prefer mutation-driven invalidation over manual full-page reload flows.
5. Use selective `refetchInterval` only where business value justifies polling.

## Polling and Refetch Conventions
- Default behavior: no automatic refetch on window focus.
- Staleness and retry defaults are managed globally.
- Topbar and notification unread counts use targeted 30s refetch intervals.

## Mutation and Invalidation
- Every create/update/delete mutation must invalidate related list/detail keys.
- Keep optimistic updates optional; prefer correctness-first invalidation unless UX requires optimistic behavior.

## Hook Coverage (Implemented)
- Auth/session: `useAuth`
- Transactions: `useTransactions`
- Notifications: `useNotifications`
- Bills: `useBills`
- Budgets/tools: `useBudgets`, `useBudgetTools`
- Wallet/transfers: `useWallet`, `useTransfers`
- Admin: `useAdminDashboard`
- Feedback: `useFeedback`
- Insights/forecasting: `useInsights`
- Settings: `useSettings`

## Testing Guidance
- Unit test pure helpers separately.
- Component tests should assert loading, error, and success states from hooks.
- Integration tests should verify mutation invalidation effects on visible UI state.
