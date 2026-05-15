# Release Gate Runbook

## Purpose
This runbook defines mandatory release gates for security, architecture, UX consistency, forecasting quality, and performance, aligned with the implementation plan in PROJECT_REVIEW.md.

## Ownership
- Tech Lead: Final release approval and risk acceptance.
- Backend Owner: API reliability, auth consistency, observability checks.
- Frontend Owner: UX consistency and API client hygiene.
- QA Owner: Regression and smoke execution sign-off.
- DevOps Owner: CI policy enforcement and deployment gate configuration.

## Gate Categories

### 1. Security Gate
Automated checks:
- Frontend and backend dependency audit jobs run in CI.
- Trivy filesystem vulnerability scan runs in CI.
- Protected endpoint smoke checks validate unauthorized access returns 401.

Manual checks:
- Verify no debug exposure endpoints are enabled in production routing.
- Confirm production secrets rotation status before major releases.

Blocking criteria:
- Any critical unresolved security finding.
- Any protected endpoint unexpectedly accessible without auth.

## 2. Architecture Gate
Automated checks:
- Frontend API URL hygiene check (`npm run check:no-localhost-api`) must pass.
- Backend test suite must pass.
- Backend smoke checks must pass.

Manual checks:
- Confirm no new route introduces non-canonical auth behavior.
- Confirm request/response contracts are documented for changed endpoints.

Blocking criteria:
- CI failure on test, smoke, or API hygiene checks.
- Unreviewed auth middleware deviations.

## 3. UX Consistency Gate
Automated checks:
- Frontend lint and tests must pass.

Manual checks:
- Validate modal/overlay behavior on key pages:
  - Focus trap works.
  - Escape closes dialogs.
  - Focus returns to trigger.
- Validate critical paths are free from blocking browser alerts.

Blocking criteria:
- Regressions in accessibility-critical interactions on key flows.

## 4. Forecasting Quality Gate
Automated checks:
- Forecast utility and service regression suites must pass.
- Backtest metric tests (MAE/RMSE/MAPE) must pass.

Manual checks:
- Verify forecast response includes confidence metadata and backtest quality.
- Review significant forecast behavior shifts before release notes sign-off.

Blocking criteria:
- Forecasting regression failures.
- Missing confidence or backtest metadata in forecast responses.

## 5. Performance and Reliability Gate
Automated checks:
- CI backend and frontend pipelines pass end-to-end.
- Smoke checks pass in deployment workflow.
- Health endpoint returns 200 after deploy.

Manual checks:
- Verify staging smoke for core routes when release is high-risk.
- Check logs for elevated error rates during canary window.

Blocking criteria:
- Deployment smoke failures.
- Persistent elevated error rates with no mitigation plan.

## Mandatory Automated Commands
Run locally before release candidate cut:

```bash
# Frontend
cd frontend
npm run lint
npm run test:coverage
npm run build

# Backend
cd ../backend
npm run test:coverage
SMOKE_BASE_URL=http://127.0.0.1:5000 SMOKE_JWT_SECRET=<jwt-secret> SMOKE_REQUIRE_AUTH_CHECK=true npm run smoke:api
```

## CI Policy Mapping
- CI workflow: `.github/workflows/ci.yml`
  - Frontend lint/test/build and API URL hygiene
  - Backend test coverage and API smoke checks
  - Security scan job
- Deployment workflow: `.github/workflows/deploy.yml`
  - Post-deploy health check
  - Post-deploy smoke checks against production backend URL

## Sign-Off Record Template
Use this section in release notes or PR description:

Canonical repository record path: `RELEASE_SIGNOFF_RECORD.md`

- Release Candidate: <version/tag>
- Date: <YYYY-MM-DD>
- Tech Lead Approval: <name>
- Backend Owner Approval: <name>
- Frontend Owner Approval: <name>
- QA Owner Approval: <name>
- DevOps Owner Approval: <name>
- Notes/Risk Acceptances: <details>
