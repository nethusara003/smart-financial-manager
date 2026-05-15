# SMART Objectives & Verification Guide

This document serves as a checklist and defense guide for your Final Year Project (FYP) objectives. Use this to ensure your report, code, and presentation evidence align with your SMART goals.

---

## 🎯 Refined SMART Objectives

1.  **Core Transaction Management**: To develop and deploy a full-stack transaction module within the **first 12 weeks**, enabling users to perform comprehensive CRUD operations on income and expense records with **100% data persistence** and category customization to facilitate active financial awareness.
2.  **Proactive Budgeting**: To implement an automated budget monitoring system by **week 16** that triggers real-time visual alerts at **80%, 90%, and 100% utilization thresholds**, providing users with actionable system-level notifications to prevent overspending.
3.  **Secure P2P Wallet**: To design and integrate an **ACID-compliant** internal digital wallet for peer-to-peer (P2P) transfers within an **8-week development sprint**, utilizing double-entry accounting principles to ensure zero balance discrepancies and maintain a reliable audit trail.
4.  **Predictive Analytics**: To deploy a predictive analytics engine by the **final project month** that leverages Linear Regression and Random Forest models to forecast short-term expenses and simulate long-term retirement scenarios with a target **MAPE (Mean Absolute Percentage Error) of less than 15%**.

---

## 🛡️ Verification & Defense Strategy (For the Panel)

If the examination panel asks: *"How did you achieve and verify these metrics?"*, use the following evidence:

### Objective 1: 100% Data Persistence
*   **Code Evidence**: Check `backend/models/Transaction.js` for strict Mongoose schema validation (e.g., `required: true`).
*   **Testing Evidence**: Refer to **Table 8.2 (Unit Testing)**. 
*   **Defense**: "Data integrity is enforced at the schema level and verified through Jest unit tests that simulate malformed inputs being rejected."

### Objective 2: Real-time Alerts (80/90/100%)
*   **Visual Evidence**: Refer to **Figure 6.19 (Budget Management Page)** in your report.
*   **Testing Evidence**: Refer to **Section 8.4 (System Testing)**.
*   **Defense**: "The system uses React state management to calculate budget utilization instantly upon every transaction entry, triggering CSS-based visual cues and system notifications at exact mathematical thresholds."

### Objective 3: Zero Balance Discrepancies
*   **Code Evidence**: Highlight `mongoose.startSession()` and `session.commitTransaction()` in your Wallet Controller.
*   **Technical Evidence**: Explain the **ACID (Atomicity, Consistency, Isolation, Durability)** properties.
*   **Defense**: "I implemented Atomic Transactions. If any part of the P2P transfer (debit or credit) fails, the entire operation rolls back. It is mathematically impossible for money to be 'lost' mid-transfer."

### Objective 4: <15% MAPE Accuracy
*   **Technical Evidence**: Show the output of your Python script's evaluation (MAPE/R2 scores).
*   **Statistical Evidence**: Include a **"Predicted vs. Actual"** comparison table in Appendix D.
*   **Defense**: "The model was trained on historical data and validated against a test set. The Random Forest Regressor achieved a MAPE of [insert your actual score, e.g., 12.8%], exceeding the project target."

---

## ✅ Final Checklist Before Submission

- [ ] Objectives in `Chapter 1.5` of the report match the 4 points above.
- [ ] Chapter 7 (Implementation) contains the Wallet ACID code snippet.
- [ ] Chapter 8 (Testing) contains test cases for the 80/90/100% alerts.
- [ ] Appendix D contains the ML validation results (MAPE score).
- [ ] Appendix F contains the Database schemas showing "required" fields for data persistence.

---

## 🔒 Security Audit & Mitigation (Evidence for 52 Alerts)

If the panel asks about the "Code Scanning" alerts on GitHub:

| Dependency | Severity | Mitigation / Defense |
| :--- | :--- | :--- |
| **sheetjs (xlsx)** | High | **Low Risk:** Used strictly for server-side exports. No processing of untrusted user uploads. |
| **axios** | High | **Patched:** Updated to `v1.7.x` via `npm audit fix`. |
| **various** | Moderate | **Resolved:** Dependency flattening performed via `npm audit fix --force`. |

**Defense:** "All high-severity vulnerabilities were analyzed. Critical libraries were patched, while low-risk vulnerabilities (like SheetJS ReDoS) were mitigated through strict input sanitization and architectural isolation."

---

## 📅 Final Sprint Log (Accurate Timeline)

Use this table for **Appendix H** to show your development journey starting from **Sept 2025**:

| Sprint | Timeline | Key Technical Deliverables |
| :--- | :--- | :--- |
| **Sprint 1** | Sep 22 – Oct 12 | System Initialization, MERN Setup, JWT Auth |
| **Sprint 2** | Oct 13 – Nov 02 | **Core Transaction Engine**, CRUD API, Categories |
| **Sprint 3** | Nov 03 – Nov 23 | Dashboard UI, Recharts Visualization Hub |
| **Sprint 4** | Nov 24 – Dec 14 | **Atomic P2P Wallet**, ACID Transaction Logic |
| **Sprint 5** | Jan 05 – Jan 25 | **Budget Alert Engine (80/90/100%)** |
| **Sprint 6** | Jan 26 – Feb 15 | Bill Reminders & Loan Tracking Logic |
| **Sprint 7** | Feb 16 – Mar 08 | **Python ML Microservice**, Expense Forecasts |
| **Sprint 8** | Mar 09 – Mar 29 | **Tracksy AI Integration**, Groq API, Draggable UI |
| **Sprint 9** | Mar 30 – Apr 19 | Random Forest Planner, Financial Health Scoring |
| **Sprint 10**| Apr 20 – May 10 | System Refinement & Final UAT |

---

## 🏗️ System Design Assumptions

Include these in **Chapter 6.2** to define your project boundaries:

1.  **Connectivity**: Constant internet access is required for **Groq AI** and **ML Microservice** communication.
2.  **Authentication**: All financial use cases assume a valid **JWT session** stored in the client.
3.  **Scope**: P2P transfers are **internal**; no direct external banking settlement is assumed.
4.  **Admin Rights**: The Admin inherits all User permissions via **Role-Based Access Control (RBAC)**.

---

## 🚀 Agile & DevOps Evidence (Proving your Methodology)

If the panel asks: *"How can you prove you followed an Agile/Sprint process?"*, show them these:

1.  **Incremental Progress**: Show the **GitHub Commit History**. 
    *   **Evidence**: Commits are distributed over 8 months (Sep 2025 – May 2026), proving iterative delivery.
2.  **Branching Strategy**: Show the `develop` and `main` branches on GitHub.
    *   **Evidence**: Separation of "Development" and "Production" codebases, a core software engineering practice.
3.  **Continuous Integration (CI)**: Show the **GitHub Actions** tab with the green checkmarks (✅).
    *   **Evidence**: Proves that every feature was automatically tested before being considered "Done."
4.  **Feature Prioritization**: Show the **MoSCoW column** in your Appendix H table.
    *   **Evidence**: Proves you managed requirements by importance (Must, Should, Could), which is the heart of Agile.
