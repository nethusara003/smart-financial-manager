# Scalability and Maintainability Improvement Plan

## Scope and Intent
This document defines a staged, low-risk refactor plan for improving scalability, maintainability, and operational reliability.

No implementation is included in this phase.

## Current-State Summary
- Monorepo with separate frontend and backend applications.
- Backend server currently mixes API bootstrapping with background scheduler startup.
- Domain complexity is increasing (loans, transfers, wallet, analytics, notifications).
- Some architectural drift exists (folder naming inconsistencies, large controllers, duplicated index declarations).
- CI is present but quality gates are uneven across frontend and backend.

## Guiding Principles
1. Minimize risk by using incremental, reversible changes.
2. Preserve feature velocity while improving architecture.
3. Introduce clear ownership boundaries by module.
4. Add guardrails (validation, linting, testing) before broad refactors.
5. Prefer standardization over one-off fixes.

---

## Stage 1: Runtime and Process Boundary Stabilization
### Goal
Separate API runtime concerns from background job/scheduler concerns.

### Why
Running schedulers inside the API process can cause duplicate job execution when scaling to multiple instances.

### Planned Deliverables
- Dedicated worker entrypoint for background jobs.
- API entrypoint reduced to HTTP concerns only.
- Updated run scripts for API and worker processes.
- Deployment model updated to run API and worker as separate services.

### Acceptance Criteria
- API can run without any scheduler startup.
- Worker can run independently and execute all scheduled jobs.
- No duplicate scheduled notifications/reminders in multi-instance environments.

### Risks and Mitigations
- Risk: accidental job duplication during transition.
- Mitigation: temporary feature flags and startup logs identifying active scheduler process.

---

## Stage 2: Backend Modularization by Domain
### Goal
Move from controller-heavy architecture to clear module boundaries with service and repository layers.

### Why
Large controllers reduce readability, increase regression risk, and make testing difficult.

### Planned Deliverables
- Domain module structure for high-impact features first (starting with loans and transactions).
- Controller, service, repository, and validator separation.
- Shared cross-cutting utilities for error handling and response patterns.

### Proposed Module Pattern
- `module.routes`
- `module.controller`
- `module.service`
- `module.repository`
- `module.validators`

### Acceptance Criteria
- Controllers contain request/response orchestration only.
- Business logic is centralized in services.
- Data access is centralized in repositories.
- High-risk endpoints covered with integration tests.

### Risks and Mitigations
- Risk: temporary breakage due to file moves/import changes.
- Mitigation: migrate endpoint-by-endpoint with compatibility wrappers.

---

## Stage 3: Data and Validation Hardening
### Goal
Improve correctness and consistency at the data boundary.

### Why
Boundary validation and data model consistency reduce runtime errors and production incidents.

### Planned Deliverables
- Request schema validation for create/update/payment flows.
- Standardized API error shape.
- Cleanup of duplicate Mongoose index declarations.
- Shared validation helpers for recurring patterns.

### Acceptance Criteria
- Invalid payloads return structured 4xx errors (not 500).
- Index warnings removed from startup logs.
- Critical write paths have explicit validation.

### Risks and Mitigations
- Risk: stricter validation may expose previously accepted malformed requests.
- Mitigation: phased rollout and endpoint-specific compatibility notes.

---

## Stage 4: Frontend Architecture Standardization
### Goal
Reduce structural drift and improve discoverability/testability in the frontend.

### Why
Inconsistent structure slows onboarding and increases accidental complexity.

### Planned Deliverables
- Single convention for provider/context folder naming.
- Route declarations split by domain to reduce app entrypoint complexity.
- API service layer normalization for error handling and response parsing.
- Removal of stale artifact files after verification.

### Acceptance Criteria
- Frontend architecture conventions documented and enforced.
- Routing remains behaviorally unchanged after route extraction.
- API error handling is consistent across pages/components.

### Risks and Mitigations
- Risk: route regressions from path migration.
- Mitigation: snapshot and smoke tests for navigation-critical routes.

---

## Stage 5: CI/CD and Quality Gates Strengthening
### Goal
Catch regressions earlier and enforce code quality consistently.

### Why
Stronger automated gates reduce production defects and maintenance burden.

### Planned Deliverables
- Backend linting and checks integrated into CI.
- Improved pre-commit hooks with meaningful staged checks.
- Contract/integration tests for critical financial flows.
- Coverage thresholds and failure policies for key modules.

### Acceptance Criteria
- CI fails on lint/test/contract regressions.
- Pre-commit catches common quality issues locally.
- Critical user journeys are protected by automated tests.

### Risks and Mitigations
- Risk: developer friction from stricter gates.
- Mitigation: progressive threshold ramp-up and clear remediation docs.

---

## Stage 6: Repository and Documentation Reorganization
### Goal
Improve long-term maintainability through better repository hygiene and documentation structure.

### Why
Scattered docs and mixed concerns in root directories reduce clarity and governance.

### Planned Deliverables
- Structured `docs/` hierarchy (architecture, deployment, operations, features).
- Architecture Decision Records (ADRs) for key choices.
- Simplified root layout containing only core entry files.

### Acceptance Criteria
- Documentation is organized by audience and purpose.
- Key architecture decisions are discoverable via ADRs.
- New contributors can navigate codebase and docs quickly.

### Risks and Mitigations
- Risk: outdated references after doc moves.
- Mitigation: redirect index and link validation checks in CI.

---

## Rollout Strategy
1. Execute stages sequentially with small, reviewable PRs.
2. Validate each stage before moving to the next.
3. Maintain backward compatibility during transitions where possible.
4. Use feature flags for behavioral changes in critical flows.

## Suggested Timeline (Indicative)
- Stage 1: 1-2 days
- Stage 2: 3-5 days
- Stage 3: 2-4 days
- Stage 4: 2-4 days
- Stage 5: 1-3 days
- Stage 6: 1-2 days

## Progress Tracking Template
Use this checklist during execution:

- [ ] Stage 1 complete and validated
- [ ] Stage 2 complete and validated
- [ ] Stage 3 complete and validated
- [ ] Stage 4 complete and validated
- [ ] Stage 5 complete and validated
- [ ] Stage 6 complete and validated

## Definition of Done (Program-Level)
- System supports independent scaling of API and worker processes.
- Domain modules follow consistent backend/frontend patterns.
- Input validation and error handling are standardized.
- Critical financial flows are protected by automated tests.
- CI/CD enforces quality gates consistently.
- Documentation and repo structure are clean and navigable.
