# Appendix Construction Guide — Smart Financial Tracker Final Report
## Complete Instructions for GitHub Copilot (VS Code)

> **Your task:** Add appendices to the final report Word document (`10953504_Final_Report__2_.docx`) and insert cross-reference sentences in the relevant main-body sections. The final report currently has **zero appendices**. Everything must go after the References section. You know the full codebase — pull real evidence (actual code, real test results, real data) for every technical appendix. Do not fabricate any data.

---

## PART 1 — GROUND RULES

1. **Every appendix must be cited in the main body.** Specific sentences to add are listed under each appendix below. Add them exactly where stated.
2. **Never duplicate** content already fully explained in the main body — cross-reference it instead.
3. **Presentation quality = main body quality.** Consistent heading styles, figure/table numbering (Table A.1, Figure B.1, etc.), professional formatting.
4. **Interview questions and survey questions are FIXED.** They were submitted in the interim report. Copy them verbatim — do not rephrase, reorder, or add to them.
5. **The system evolved significantly from interim to final.** The appendices must reflect the **final system**: Python ML microservice (Scikit-Learn Random Forest, not just linear regression), Groq LLM AI assistant "Tracksy", 2FA email OTP login, Monte Carlo retirement planner, draggable UI widget. Do not refer to old interim-stage features as if they are the current ones.
6. **Survey data is real and fixed.** The statistics below come from the actual 36-response Google Form dataset. Use them exactly — do not invent percentages.

---

## PART 2 — MAIN BODY IMPROVEMENTS

The following sentences must be inserted into the main body at the stated locations. They do not change the substance of any existing paragraph — they add cross-references and strengthen evidence-thin sentences with real survey data.

### 2.1 Chapter 4, Section 4.5.1 (Semi-Structured Interviews)
Append to the end of the section:
> "The full interview protocol, question set, sample participant excerpts, and thematic findings are provided in Appendix A."

### 2.2 Chapter 4, Section 4.5.2 (Questionnaires and Surveys)
Append to the end of the section:
> "A structured quantitative survey was distributed to 36 participants across the target demographic between 10–12 May 2026, yielding a 100% completion rate. Key findings confirmed the behavioural patterns identified during interviews: 83.3% of respondents forget to record expenses at least sometimes, 61.1% rated their financial confidence at 3 or below out of 5, and budget management was the single most-desired feature identified by the largest respondent group. The complete survey instrument and full statistical results are provided in Appendix B."

### 2.3 Chapter 5, Section 5.3.2 (Conducting Questionnaires)
Append to the end of the section:
> "The survey further revealed that 88.9% of respondents rated a simple and user-friendly interface as very important (average 4.50/5), and 88.9% prefer graphical reports and charts for analysing expenses — directly validating the SFT's investment in interactive Recharts visualisations. Full questionnaire and aggregated results are in Appendix B."

### 2.4 Chapter 3, Section 3.2 (Critical Evaluation of Existing Commercial Systems)
Append after the final competitor paragraph:
> "A structured competitive feature matrix comparing the SFT platform against YNAB, PocketGuard, Mint/Credit Karma, and Monarch Money across fourteen dimensions is provided in Appendix C."

### 2.5 Chapter 6, Section 6.3 (Class Diagram — MongoDB Collections)
Append to the end of the section:
> "Full field-level schema definitions for all MongoDB collections, including data types, constraints, and relationship notes, are provided in Appendix F."

### 2.6 Chapter 6, Section 6.8 (Backend Architecture — API Structure)
Append to the end of the section:
> "A complete API endpoint reference table, including HTTP methods, route paths, authentication requirements, and role constraints for all modules, is provided in Appendix G."

### 2.7 Chapter 8, Section 8.1 (Introduction to the Testing Strategy)
Append to the end of the section:
> "Full documented test case results — including unit, integration, system, non-functional, and security test outcomes — are provided in Appendix D."

### 2.8 Chapter 8, Section 8.5 (User Acceptance Testing)
Append after the acceptance test case paragraph:
> "The UAT survey instrument and aggregated qualitative and quantitative feedback results from the closed beta testing group are provided in Appendix E."

### 2.9 Chapter 4, Section 4.3 (Sprint Management and Version Control)
Append to the end of the section:
> "The complete sprint-by-sprint log, including dates, primary deliverables, and MoSCoW backlog classification, is provided in Appendix H."

### 2.10 Chapter 4, Section 4.1 (Introduction to Methodology)
Append to the end of the section:
> "A detailed theoretical comparison of the Agile framework against traditional sequential models, including the specific risk mitigation strategies adopted for this project, is provided in Appendix O."

### 2.11 Chapter 4, Section 4.4 (Technological Stack)
Append to the end of the section:
> "Comprehensive technical specifications for the MERN stack and the Python microservices, including a critical evaluation of these technologies against industry alternatives, are documented in Appendix P."


---

## PART 3 — THE APPENDICES

---

## Appendix A — Interview Research Materials

### A.1 Purpose
This appendix contains the full research protocol, interview questions, sample participant data, and thematic findings from the semi-structured qualitative interviews conducted during the requirements gathering phase.

### A.2 Research Overview

**Objective:** To understand financial management practices, pain points, and user expectations among the target demographic in order to define the functional and non-functional requirements of the SFT platform.

**Methodology:**
- Semi-structured interviews with **26 participants**:
  - 15 university students (aged 19–24)
  - 8 early-career professionals (1–3 years post-graduation)
  - 3 financial educators
- Conducted via Zoom and in-person, **December 2025 – January 2026**
- Duration: 20–35 minutes per session
- Sampling method: Convenience sampling through university networks and LinkedIn groups
- Analysis method: Thematic coding; four primary themes identified

**Ethical considerations:**
- Informed consent obtained prior to every session
- Anonymised participant identifiers used (S1–S15, P1–P8, E1–E3)
- Participants retained the right to withdraw at any point
- All data handled confidentially and stored securely

### A.3 Core Interview Questions
*(FIXED. Copy verbatim — do not alter wording, order, or phrasing under any circumstances.)*

**Section 1: Current Financial Management Practices**
1. How do you currently track your income and expenses?
2. How frequently do you review your financial records?
3. Do you organise your spending into categories?
4. Have you previously used budgeting or personal finance applications?
5. If you stopped using them, what were the primary reasons?

**Section 2: Financial Awareness and Behaviour**
1. On a scale of 1–10, how aware are you of your spending patterns on a daily basis?
2. How often do you discover unexpected expenses at the end of the month?
3. Do you set financial goals? If so, how do you track progress toward them?
4. What has prevented you from achieving financial goals in the past?
5. How comfortable do you feel with your current level of financial control?

**Section 3: Pain Points and Challenges**
1. What is your primary challenge in managing personal finances effectively?
2. Have you ever felt mentally disconnected from your spending when using automated tools?
3. Do you have recurring subscriptions or hidden expenses that you sometimes forget about?
4. How much time do you spend weekly managing or reconciling financial data?
5. Have you ever exceeded a budget without realising until it was too late?

**Section 4: Feature Expectations**
1. Would you prefer manual transaction entry or automated bank synchronisation, and why?
2. What features would make you use a financial application consistently for over 6 months?
3. How important are proactive alerts (before overspending) vs. reactive alerts (after overspending)?
4. Would integrated peer-to-peer transfer functionality be valuable to you?
5. Do you manage expenses in multiple currencies?
6. Would predictive expense forecasting influence your financial decisions?

**Section 5: Privacy and Security**
1. Do you have concerns about connecting your bank account to a third-party application?
2. On a scale of 1–10, how important is data privacy to you in financial applications?
3. Would you prefer a manual-entry system to avoid sharing banking credentials?
4. What security features would be necessary for you to trust a financial platform?

**Section 6: Open-Ended Insights**
1. If you could design your ideal financial management system, what would it look like?
2. What would motivate you to use a financial application consistently over the long term?
3. Is there anything else you would like to share regarding your financial management needs?

### A.4 Sample Participant Excerpt

**Participant S2 (Postgraduate Student) — Active Awareness Gap Theme**

*Interviewer:* "You mentioned Google Sheets. How often do you actually update it?"

*S2:* "Honestly, maybe once a month. By the time I sit down to enter everything, I've forgotten half of what I spent. I'll check my bank statement and think, 'Did I really spend that much on food last week?' It's always a shock. If I entered transactions right after each purchase, I'd probably be more careful. It's similar to writing notes by hand — you remember better. The same applies to finances."

*This response illustrates the recurring theme of reduced financial awareness caused by delayed tracking, directly supporting the SFT's emphasis on immediate manual transaction entry to reinforce behavioural engagement.*

### A.5 Key Thematic Findings

**Table A.1 — Interview Thematic Analysis Summary**

| Theme | Description | Prevalence | SFT Design Response |
|-------|-------------|------------|---------------------|
| Active Awareness Gap | Automation reduces cognitive engagement; users become passive observers | Dominant across all participant groups | Manual-first transaction entry; no forced bank sync |
| Subscription Fatigue | Participants regularly forget recurring payments, causing financial leakage | 78% of participants | Dedicated recurring bills tracker with annualised cost view |
| Privacy Concerns | Reluctance to connect bank accounts to third-party applications | 73% of participants | Zero bank integration; all data user-controlled |
| Fragmented Ecosystems | Separate apps for budgeting, P2P, and savings create incomplete visibility | 87% of participants | Unified SFT ecosystem: wallet, budgets, goals, analytics, AI |

*Thematic saturation was achieved after 21 interviews. The final 5 sessions introduced no new themes, confirming adequate sample coverage.*

---

## Appendix B — Quantitative Survey: Financial Behaviours of Emerging Adults

### B.1 Purpose
This appendix contains the complete survey instrument and full statistical findings from the quantitative research study conducted to validate the requirements identified during qualitative interviews.

### B.2 Research Overview

**Table B.1 — Survey Research Parameters**

| Item | Detail |
|------|--------|
| Survey period | 10–12 May 2026 |
| Distribution method | Google Forms (anonymous online) |
| Total responses | 36 (100% completion rate) |
| Participant breakdown | 20 university students, 8 early-career professionals, 4 financial educators, 2 self-employed, 2 other |
| Age distribution | 18–20: 19.4% | 21–24: 61.1% | 25–30: 11.1% | Above 30: 8.3% |
| Average completion time | 8–12 minutes |
| Analysis method | Descriptive statistics, frequency distributions, Likert-scale averages |

### B.3 Complete Survey Questionnaire
*(FIXED. Copy verbatim — do not alter any question or response option under any circumstances.)*

**Section 1: Demographic Information**

**Q1.** What is your age group?
- 18–20 | 21–24 | 25–30 | Above 30

**Q2.** What is your current status?
- University Student | Early-Career Professional | Financial Educator | Self-Employed | Other

**Section 2: Current Financial Behaviour**

**Q3.** Do you track your daily expenses?
- Yes | Sometimes | No

**Q4.** How do you currently manage your finances? *(Select all that apply)*
- Mental tracking | Notebook/manual records | Excel spreadsheets | Mobile finance applications | Bank applications | I do not track my expenses

**Q5.** What financial problems do you commonly face? *(Select all that apply)*
- Overspending | Forgetting expenses | Difficulty saving money | No proper expense tracking | Difficulty analysing spending habits | Lack of budgeting

**Q6.** How often do you forget to record your expenses?
- Never | Rarely | Sometimes | Very Often

**Q7.** How confident are you in managing your personal finances?
- 1 (Not confident at all) — 5 (Very confident)

**Section 3: Experience with Finance Applications**

**Q8.** Have you used any finance tracking applications before?
- Yes | No

**Q9.** If yes, what problems did you experience with existing finance apps? *(Select all that apply)*
- Too complicated to use | Too many unnecessary features | Difficult user interface | Time-consuming data entry | Paid features/paywalls | Privacy concerns | Lack of useful visual reports

**Section 4: Feature Preferences**

**Q10.** Which features would you most prefer in a Smart Finance Tracker application? *(Select all that apply)*
- Daily expense tracking | Budget management | Savings tracking | Spending alerts | Monthly financial reports | Visual charts and graphs | Expense reminders | Manual expense entry | Forecasting future expenses

**Q11.** How important is a simple and user-friendly interface?
- 1 (Not important) — 5 (Very important)

**Q12.** How useful would visual budget alerts be at 80%, 90%, and 100% spending levels?
- 1 (Not useful) — 5 (Very useful)

**Q13.** Which expense tracking method would you prefer?
- Manual expense entry | Automatic bank synchronisation | Combination of both

**Section 5: Privacy and Security**

**Q14.** How important is privacy protection in a finance tracking app?
- 1 (Not important) — 5 (Very important)

**Q15.** Which security features would you expect from the application? *(Select all that apply)*
- Password protection | Fingerprint authentication | Secure login | Data backup and recovery

**Section 6: Notifications and Reporting**

**Q16.** Which feature is MOST important to you?
- Expense tracking | Budget management | Savings tracking | Notifications/reminders | Reports & charts | Security features

**Q17.** Would reminder notifications help you manage finances better?
- Yes | Maybe | No

**Q18.** Do you prefer graphical reports/charts to analyse expenses?
- Yes | No

**Q19.** What additional features would you like to see in the app?
*(Open text)*

**Q20.** Any suggestions for improving a finance tracking application?
*(Open text)*

### B.4 Full Statistical Results

**Table B.2 — Demographic Breakdown (n = 36)**

| Category | Value | Count | Percentage |
|----------|-------|-------|------------|
| Age | 18–20 | 7 | 19.4% |
| Age | 21–24 | 22 | 61.1% |
| Age | 25–30 | 4 | 11.1% |
| Age | Above 30 | 3 | 8.3% |
| Status | University Student | 20 | 55.6% |
| Status | Early-Career Professional | 8 | 22.2% |
| Status | Financial Educator | 4 | 11.1% |
| Status | Self-Employed | 2 | 5.6% |
| Status | Other | 2 | 5.6% |

---

**Table B.3 — Q3: Do you track your daily expenses?**

| Response | Count | Percentage |
|----------|-------|------------|
| Yes | 13 | 36.1% |
| Sometimes | 16 | 44.4% |
| No | 7 | 19.4% |

*63.9% of respondents do not consistently track their expenses, validating the SFT's emphasis on a low-friction manual entry interface to encourage habit formation.*

---

**Table B.4 — Q4: How do you currently manage your finances?** *(multi-select)*

| Method | Count | % of Respondents |
|--------|-------|-----------------|
| Mental tracking | 13 | 36.1% |
| Mobile finance applications | 8 | 22.2% |
| Bank applications | 7 | 19.4% |
| Notebook/manual records | 7 | 19.4% |
| Excel spreadsheets | 4 | 11.1% |
| I do not track my expenses | 4 | 11.1% |

---

**Table B.5 — Q5: Financial problems commonly faced** *(multi-select)*

| Problem | Count | % of Respondents |
|---------|-------|-----------------|
| Overspending | 16 | 44.4% |
| Difficulty saving money | 15 | 41.7% |
| Forgetting expenses | 10 | 27.8% |
| Difficulty analysing spending habits | 9 | 25.0% |
| No proper expense tracking | 6 | 16.7% |
| Lack of budgeting | 5 | 13.9% |

---

**Table B.6 — Q6: How often do you forget to record expenses?**

| Frequency | Count | Percentage |
|-----------|-------|------------|
| Never | 2 | 5.6% |
| Rarely | 4 | 11.1% |
| Sometimes | 17 | 47.2% |
| Very Often | 13 | 36.1% |

*83.3% forget to record expenses at least sometimes — a core behavioural gap the SFT addresses through immediate-entry prompts and a persistent mobile-responsive interface.*

---

**Table B.7 — Q7: Financial confidence rating (1–5 scale)**

| Rating | Count | Percentage |
|--------|-------|------------|
| 1 — Not confident at all | 3 | 8.3% |
| 2 | 8 | 22.2% |
| 3 | 12 | 33.3% |
| 4 | 9 | 25.0% |
| 5 — Very confident | 4 | 11.1% |

**Average: 3.00 / 5.00** — *61.1% rated their confidence at 3 or below, confirming a broad practical financial management skill deficit.*

---

**Table B.8 — Q8: Have you used finance tracking apps before?**

| Response | Count | Percentage |
|----------|-------|------------|
| Yes | 15 | 41.7% |
| No | 21 | 58.3% |

---

**Table B.9 — Q9: Problems with existing apps** *(multi-select; from 15 prior users)*

| Problem | Count | % of Prior App Users |
|---------|-------|---------------------|
| Too many unnecessary features | 10 | 66.7% |
| Time-consuming data entry | 9 | 60.0% |
| Too complicated to use | 7 | 46.7% |
| Paid features/paywalls | 7 | 46.7% |
| Privacy concerns | 7 | 46.7% |
| Difficult user interface | 6 | 40.0% |
| Lack of useful visual reports | 6 | 40.0% |

*The three dominant pain points — feature bloat, data entry friction, and privacy — directly informed the SFT's design: minimal, manual-first, zero bank-credential requirement.*

---

**Table B.10 — Q10: Most preferred features** *(multi-select)*

| Feature | Count | % of Respondents |
|---------|-------|-----------------|
| Budget management | 21 | 58.3% |
| Daily expense tracking | 20 | 55.6% |
| Spending alerts | 16 | 44.4% |
| Savings tracking | 15 | 41.7% |
| Visual charts and graphs | 13 | 36.1% |
| Monthly financial reports | 13 | 36.1% |
| Expense reminders | 12 | 33.3% |
| Forecasting future expenses | 6 | 16.7% |
| Manual expense entry | 2 | 5.6% |

---

**Q11 — Importance of a simple, user-friendly interface (1–5)**
**Average: 4.50 / 5.00** — *88.9% rated this 4 or 5, making UI simplicity a non-negotiable design requirement.*

**Q12 — Usefulness of progressive budget alerts at 80%, 90%, 100% (1–5)**
**Average: 4.17 / 5.00** — *Strongly validates the SFT's three-tier notification system.*

---

**Table B.11 — Q13: Preferred expense tracking method**

| Method | Count | Percentage |
|--------|-------|------------|
| Combination of both | 23 | 63.9% |
| Manual expense entry | 8 | 22.2% |
| Automatic bank synchronisation | 5 | 13.9% |

*86.1% prefer manual entry or a hybrid approach, reinforcing the decision to prioritise manual recording.*

---

**Q14 — Importance of privacy protection (1–5)**
**Average: 4.58 / 5.00** — *The highest-scoring metric in the entire survey. Privacy is the primary trust barrier; confirmed the exclusion of bank API synchronisation.*

---

**Table B.12 — Q15: Expected security features** *(multi-select)*

| Security Feature | Count | % of Respondents |
|-----------------|-------|-----------------|
| Password protection | 19 | 52.8% |
| Fingerprint authentication | 19 | 52.8% |
| Secure login | 19 | 52.8% |
| Data backup and recovery | 14 | 38.9% |

---

**Table B.13 — Q16: Single most important feature**

| Feature | Count | Percentage |
|---------|-------|------------|
| Budget management | 9 | 25.0% |
| Savings tracking | 7 | 19.4% |
| Notifications/reminders | 6 | 16.7% |
| Security features | 6 | 16.7% |
| Reports & charts | 4 | 11.1% |
| Expense tracking | 4 | 11.1% |

---

**Table B.14 — Q17: Would reminders help manage finances better?**

| Response | Count | Percentage |
|----------|-------|------------|
| Yes | 20 | 55.6% |
| Maybe | 16 | 44.4% |
| No | 0 | 0.0% |

*100% of respondents indicated reminders would be helpful or possibly helpful, directly validating the SFT's automated bill reminder and budget alert notification systems.*

---

**Table B.15 — Q18: Prefer graphical reports/charts?**

| Response | Count | Percentage |
|----------|-------|------------|
| Yes | 32 | 88.9% |
| No | 4 | 11.1% |

*88.9% prefer visual analytics, confirming the Recharts-powered dashboard as a core user need, not a cosmetic feature.*

### B.5 Notable Open-Text Responses (Q19 & Q20)

**Table B.16 — Qualitative Themes from Open-Text Feedback**

| Theme | Representative Responses |
|-------|--------------------------|
| AI-powered guidance | "A guidance chatbot." / "AI-based spending suggestions and bill reminders." |
| Machine learning forecasting | "A machine learning model trained from previous financial data of general user types. Adding one to the system may help significantly." |
| Privacy emphasis | "The app should protect user data and avoid unnecessary permissions." |
| Weekly summaries | "Weekly spending reports and customizable categories." / "Weekly spending summaries with smart insights." |
| Simplicity for students | "The app should provide quick summaries that students can understand easily." / "The application should motivate students to save money regularly." |
| Customisation | "Dark mode and customizable expense categories." |
| Export capability | "Option to export reports as PDF or Excel." |
| Faster entry | "It should take less time to enter expenses and give quick reminders." |

*The explicit user requests for an AI chatbot and machine learning forecasting retrospectively validate the SFT's inclusion of the Tracksy Groq LLM assistant and the Python Scikit-Learn Random Forest microservice — two features that exceeded the original interim scope but aligned precisely with expressed user demand.*

### B.6 Research Validation

Survey findings corroborate the following literature cited in the main report:
- **NCAN (2024):** Financial hardship and inability to cover unexpected expenses
- **OECD (2024):** Student financial literacy gap and the overconfidence paradox
- **Santander UK (2025):** Young adults lacking formal budgeting habits

---

## Appendix C — Competitive Analysis of Financial Tracking Systems

### C.1 Purpose
This appendix provides the full structured competitive benchmarking data used to identify design gaps and prioritise SFT features during the requirements phase.

### C.2 Benchmarking Scope

Four market-leading personal finance applications were evaluated across 14 dimensions during January–February 2026.

### C.3 Full Competitive Feature Matrix

**Table C.1 — SFT Platform vs. Competitor Feature Comparison**

| Feature | SFT Platform | YNAB | PocketGuard | Mint / Credit Karma | Monarch Money |
|---------|-------------|------|-------------|---------------------|---------------|
| Budget Model | Manual-first; 50/30/20 auto-generate | Zero-based (every dollar assigned) | Snapshot ("In My Pocket") | Automated categorisation | Fully customisable |
| Monthly Cost | Free / Open Source | $14.99/month ($109/year) | $12.99/month | Free (ad-supported) | $14.99/month (no free tier) |
| Predictive Analytics | ML — Random Forest Regressor (Python microservice) | None | Basic | None | Basic |
| AI Chatbot Assistant | Tracksy (Groq LLM API, draggable widget) | None | None | None | None |
| P2P Wallet Transfers | Integrated internal wallet (ACID-compliant) | None | None | None | None |
| Goal Tracking | Milestone-based with progress indicators | Advanced | Basic | Basic | Advanced |
| Bank API Sync | Intentionally excluded (privacy-first design) | Required (Plaid) | Required | Required | Required (Plaid) |
| Two-Factor Authentication | Yes — email OTP | No | No | No | No |
| Retirement / Long-Term Planning | Monte Carlo simulation tool | No | No | No | Basic projection |
| Multi-Currency Support | User-selectable display currency | Yes (premium) | No | No | Yes |
| Mobile UX | Responsive web app (React, mobile-first CSS) | Dedicated native app | Dedicated native app | Dedicated native app | Dedicated native app |
| WCAG 2.1 AA Accessibility | Yes | Partial | No | No | Partial |
| Data Privacy | No bank credentials required | Bank OAuth required | Bank OAuth required | Bank credentials required | Bank OAuth required |
| Price Barrier for Students | None | High ($109/year) | Moderate ($156/year) | None (ad-driven) | High ($180/year) |

### C.4 Identified Gaps and SFT Responses

**Table C.2 — Pain Point Analysis and SFT Solutions**

| Identified Gap | Behavioural / Technical Impact | SFT Design Response |
|---------------|-------------------------------|---------------------|
| Excessive automation across all competitors | Reduces cognitive awareness; users disengage from real spending | Structured manual entry restores mindful engagement |
| Reactive-only budget alerts | Correction happens after overspend has already occurred | Progressive alerts at 80%, 90%, 100% |
| No integrated P2P functionality | Users juggle separate P2P apps alongside their budget app | Native internal wallet with atomic ACID transactions |
| No AI guidance layer | Users leave the app to search for financial advice externally | Tracksy: Groq LLM chatbot embedded directly in dashboard |
| No ML forecasting | Users cannot anticipate future financial strain | Python microservice: Random Forest Regressor predictions |
| High subscription cost | Enterprise tools inaccessible to the student demographic | Fully free; open-source deployment |
| Bank credential requirement | 46.7% of prior app users cited privacy as a major pain point (Appendix B, Table B.9) | Zero bank integration; 100% user-controlled data |

### C.5 Summary Verdict

No single existing competitor combines zero cost, privacy-first manual entry, integrated ML forecasting, an LLM chatbot assistant, P2P transfers, and WCAG 2.1 AA accessibility in one platform. This intersection of gaps defines the SFT's unique value proposition within the personal finance management market.

---

## Appendix D — Full System Test Results

### D.1 Purpose
This appendix contains the complete documented test results across all testing phases described in Chapter 8.

### D.2 Instructions for Copilot
1. **Run the full Jest/Vitest test suite** — capture actual pass/fail output.
2. **Run a Google Lighthouse audit** on the production or staging build — capture actual scores.
3. **Execute Postman security tests** — capture actual HTTP response codes and timings.
4. **Do not invent any result.** If a test has not been written, mark it as "Pending — not yet implemented". Never mark an unrun test as Pass.
5. Populate every table with real data from your actual test runs.

### D.3 Unit Test Results

*(Copilot: Run Jest. Populate from actual output. Every row must reflect a real test case.)*

**Table D.1 — Unit Test Results**

| Test ID | Module | Test Description | Given | When | Then | Result |
|---------|--------|-----------------|-------|------|------|--------|
| UT-01 | Wallet Controller | Insufficient funds rejected | Wallet balance = $50 | Transfer of $100 requested | HTTP 400 returned; DB unchanged | |
| UT-02 | Budget Alert Service | 80% threshold triggers alert | Budget $200; $160 spent | New $5 expense added | Alert object created at "warning" level | |
| UT-03 | Budget Alert Service | 90% threshold triggers alert | Budget $200; $180 spent | New $5 expense added | Alert object created at "danger" level | |
| UT-04 | Budget Alert Service | 100% threshold triggers email | Budget $200; $200 spent | Any new expense added | "exceeded" level alert; SendGrid called | |
| UT-05 | Auth Middleware | Valid JWT passes middleware | Valid JWT in HTTP-only cookie | Request to protected route | req.user populated; next() called | |
| UT-06 | Auth Middleware | Missing token blocked | No cookie | Request to protected route | HTTP 401 returned | |
| UT-07 | Auth Middleware | Expired token blocked | Expired JWT in cookie | Request to protected route | HTTP 401 returned | |
| UT-08 | Transfer Controller | UUID idempotency prevents double debit | Duplicate UUID submitted | Second transfer request | Second request rejected; no duplicate deduction | |
| UT-09 | ML Forecast Proxy | Insufficient data handled gracefully | User has < 3 months of data | Forecast requested | Returns "insufficient data" message; no chart rendered | |
| UT-10 | Financial Health Score | Weighted formula accuracy | Known test financial dataset | Score calculated | Result matches expected weighted output | |
| *(add all remaining Jest unit tests from your test files)* | | | | | | |

### D.4 Integration Test Results

*(Copilot: Run integration tests. Populate from actual output.)*

**Table D.2 — Integration Test Results**

| Test ID | Integration Point | Scenario | Expected Outcome | Actual Outcome | Result |
|---------|------------------|----------|-----------------|----------------|--------|
| IT-01 | Node.js → Python ML Microservice | Forecast request with 12-month history | JSON payload returned; no CORS error; response < 10s | | |
| IT-02 | Node.js → MongoDB (ACID session) | P2P transfer — atomic commit | Both wallet balances updated together or both rolled back | | |
| IT-03 | Node.js → SendGrid | Budget alert at 100% threshold | Email delivered to user inbox | | |
| IT-04 | Node.js → Groq LLM API | Tracksy query submission | Contextual response returned within 5 seconds | | |
| IT-05 | React Frontend → Node.js API | Dashboard initial data load | Summary, budgets, and transactions load without error | | |
| IT-06 | CRON Scheduler → MongoDB → SendGrid | Bill reminder 3 days before due date | Reminder email sent to correct user | | |
| *(add remaining integration tests)* | | | | | |

### D.5 System Test Results (Manual)

*(Copilot: Execute each scenario step-by-step in the browser. Record actual outcomes.)*

**Table D.3 — Manual System Test Results**

| Test ID | Feature | Steps | Expected Result | Actual Result | Pass/Fail |
|---------|---------|-------|-----------------|---------------|-----------|
| ST-01 | Budget alert end-to-end | 1. Set Groceries budget $200. 2. Record $190 groceries. 3. Add $20 grocery expense. | Red "Budget Exceeded" badge; transaction added to ledger | | |
| ST-02 | P2P Transfer — success path | 1. Login User A (wallet $500). 2. Transfer $200 to User B. 3. Check both wallets. | User A: $300; User B: +$200; audit log entry created | | |
| ST-03 | P2P Transfer — insufficient funds | 1. Login User A (wallet $50). 2. Attempt $200 transfer. | Error shown; both balances unchanged | | |
| ST-04 | ML Expense Forecast | 1. Ensure 12 months of transaction data exist. 2. Navigate to Forecast page. | Forecast chart rendered with confidence band; no console error | | |
| ST-05 | 2FA Login | 1. Enter valid credentials. 2. Receive OTP email. 3. Enter OTP. | Authenticated; redirected to dashboard | | |
| ST-06 | Tracksy AI Assistant | 1. Click Tracksy floating widget. 2. Type "How do I reduce my subscription costs?" | Relevant financial tip returned within 5 seconds | | |
| ST-07 | Savings Goal Creation | 1. Navigate to Goals. 2. Create goal: target $1,000, 6-month deadline. 3. Add $100 contribution. | Goal card shows 10% progress; contribution logged | | |
| ST-08 | Bill Reminder | 1. Register a recurring bill due in 3 days. 2. Trigger or wait for CRON. | Reminder email received in user inbox | | |
| ST-09 | Data Export (CSV) | 1. Navigate to Reports. 2. Request CSV export for current month. | CSV downloads with correct transaction data | | |
| ST-10 | Dark Mode Persistence | 1. Toggle dark mode ON. 2. Refresh browser. | Dark theme re-applied on reload without flash | | |
| *(add remaining manual system tests)* | | | | | |

### D.6 Non-Functional Test Results

*(Copilot: Run Lighthouse on the production build. Run Postman tests. Record actual values.)*

**Table D.4 — Non-Functional Test Results**

| Test | Tool | Metric | Target | Actual Result | Pass/Fail |
|------|------|--------|--------|---------------|-----------|
| Performance Score | Google Lighthouse | Lighthouse performance | ≥ 85 / 100 | | |
| Accessibility Score | Google Lighthouse | Lighthouse accessibility | ≥ 90 / 100 | | |
| Best Practices Score | Google Lighthouse | Lighthouse best practices | ≥ 85 / 100 | | |
| API Response Time | Chrome DevTools Network | P95 CRUD response time | < 300 ms | | |
| Dashboard Load | Chrome DevTools | Time to interactive | < 3 seconds | | |
| JWT — No Token | Postman | HTTP status: no cookie on `/api/wallet/balance` | HTTP 401 in < 200 ms | | |
| JWT — Invalid Token | Postman | HTTP status: forged JWT on protected route | HTTP 401 | | |
| Role Escalation | Postman | Guest hitting `/api/admin` route | HTTP 403 | | |

---

## Appendix E — User Acceptance Testing: Survey Instrument and Results

### E.1 Purpose
This appendix contains the UAT survey instrument distributed to the closed beta testing group and the aggregated feedback that validated the SFT platform prior to final submission.

### E.2 UAT Setup

**Table E.1 — UAT Parameters**

| Item | Detail |
|------|--------|
| Testers | University peers, classmates, and friends representing the core target demographic |
| Environment | Staging deployment (Render backend + Vercel frontend) |
| Collection method | Google Forms (anonymous) |
| Number of tasks | 8 structured tasks (see Section E.3) |

### E.3 Tasks Assigned to Beta Testers

Testers completed the following tasks independently, without guidance, to simulate real usage:

1. Register a new account and complete profile setup (currency, display name)
2. Log 5 transactions across at least 3 different expense categories
3. Set a monthly budget limit for 2 categories and observe the progress bar update
4. Initiate a P2P wallet transfer to another registered test user
5. Open the Tracksy AI assistant and ask one financial question of their choice
6. Navigate to the Forecast or Analytics page and interpret what they see
7. Toggle dark mode and confirm it persists after a page refresh
8. Complete the UAT feedback survey

### E.4 UAT Survey Instrument

**Table E.2 — UAT Survey Questions**

| # | Question | Response Type |
|---|----------|---------------|
| 1 | How easy was it to register and set up your account? | Likert 1–5 |
| 2 | How intuitive was the transaction logging process? | Likert 1–5 |
| 3 | How clear was the budget tracking interface? | Likert 1–5 |
| 4 | How easy was the P2P transfer process? | Likert 1–5 |
| 5 | How helpful was the Tracksy AI assistant's response? | Likert 1–5 |
| 6 | Did the dashboard clearly show your financial position? | Yes / No |
| 7 | Would you use this application regularly for your own finances? | Yes / No / Maybe |
| 8 | How does SFT compare to other finance apps you have used? | Better / Same / Worse / Never used another |
| 9 | Did you feel your data was private and secure? | Yes / No |
| 10 | What did you like most about the application? | Open text |
| 11 | What could be improved? | Open text |
| 12 | Overall satisfaction rating | 1–10 |

### E.5 Aggregated UAT Results

*(Copilot: Populate this table from the actual Google Forms UAT responses collected during the beta phase. If you have a raw responses file or spreadsheet, extract the real numbers. Do not fabricate any figure.)*

**Table E.3 — UAT Quantitative Results**

| Metric | Score / Finding |
|--------|----------------|
| Average ease of registration | X.X / 5 |
| Average transaction logging intuitiveness | X.X / 5 |
| Average budget interface clarity | X.X / 5 |
| Average P2P transfer ease | X.X / 5 |
| Average Tracksy helpfulness | X.X / 5 |
| Dashboard clearly showed financial position (Yes %) | XX% |
| Would use regularly (Yes + Maybe %) | XX% |
| Felt data was private and secure (Yes %) | XX% |
| Rated SFT better than other apps (Better %) | XX% |
| Average overall satisfaction | X.X / 10 |

### E.6 Key Qualitative Themes

**Table E.4 — UAT Open-Text Themes and Outcomes**

| Theme | Feedback Summary | Action Taken |
|-------|-----------------|--------------|
| Privacy and Trust | Users explicitly praised the absence of bank syncing; described SFT as feeling safer than commercial alternatives | Design decision validated; no change required |
| Dashboard Clarity | Pie charts and line graphs praised for immediately revealing subscription and discretionary spend patterns | No change required |
| Tracksy AI Chatbot | Testers valued staying in one browser tab rather than switching to a separate search — rated interaction as natural | No change required |
| Mobile Viewport | Some testers noted the draggable Tracksy widget occasionally overlapped the bottom nav bar on narrow phone screens | CSS media query fix applied prior to final submission |

---

## Appendix F — MongoDB Collection Schema Reference

### F.1 Purpose
This appendix provides field-level schema definitions for all MongoDB collections in the SFT platform. This level of detail is too low-level for the main design chapter but is essential for developer reference and academic transparency.

### F.2 Instructions for Copilot
Open each Mongoose schema file in `backend/models/` (or equivalent). For every collection, produce a table using the format below. Do **not** copy raw JavaScript — present it as a clean readable reference. Use the exact field names from your schema files. Fill in all constraints, defaults, and relationship references accurately.

### F.3 Schema Tables

*(Use this exact format for every collection. Populate all rows from your actual Mongoose files.)*

---

**Table F.1 — Collection: `users`**

| Field | Mongoose Type | Required | Constraints / Notes |
|-------|--------------|----------|---------------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `firstName` | String | Yes | *(fill from your schema)* |
| `lastName` | String | Yes | |
| `email` | String | Yes | Unique; lowercase; email format validated |
| `password` | String | Yes | bcrypt hashed (10 salt rounds) |
| `role` | String (Enum) | Yes | `user`, `admin`, `super_admin`, `guest` |
| `currency` | String | Yes | Default: `USD` |
| `otpToken` | String | No | Temporary 2FA verification token |
| `otpExpiry` | Date | No | Token expiration timestamp |
| `isVerified` | Boolean | Yes | Default: `false` |
| `transferPin` | String | No | bcrypt hashed; required for transfers above PIN threshold |
| `createdAt` | Date | Auto | Mongoose timestamps plugin |
| `updatedAt` | Date | Auto | Mongoose timestamps plugin |

---

Produce equivalent tables (Table F.2, F.3, etc.) for every collection below. Extract all fields from your actual schema files:

- **Table F.2 — `transactions`** — userId (ref), type (enum: income/expense), category, amount (Decimal128), note, date, paymentMethod, createdAt, updatedAt
- **Table F.3 — `budgets`** — userId (ref), category, limitAmount, spent, alertThreshold, lastAlertLevel, period, createdAt, updatedAt
- **Table F.4 — `goals`** — userId (ref), title, targetAmount, currentAmount, deadline, status (enum), contributions (array), createdAt, updatedAt
- **Table F.5 — `bills`** — userId (ref), name, amount, frequency (enum), dueDate, isPaid, reminderSent, createdAt, updatedAt
- **Table F.6 — `wallets`** — userId (ref, unique), balance (Decimal128), currency, createdAt, updatedAt
- **Table F.7 — `transfers`** — sender (ref User), receiver (ref User), amount, description, status (enum), transferId (UUID v4, unique), reverseReason, createdAt, updatedAt
- **Table F.8 — `notifications`** — userId (ref), type (enum), title, message, read (Boolean), data (Object), actionUrl, color, icon, createdAt
- **Table F.9 onwards** — any additional collections present in your Atlas cluster (loans, auditlogs, etc.)

---

## Appendix G — API Endpoint Reference

### G.1 Purpose
This appendix provides a complete reference of all backend REST API endpoints, derived directly from the Express.js router files.

### G.2 Instructions for Copilot
Open every file in `backend/routes/` (or equivalent). Extract every `router.get`, `router.post`, `router.put`, `router.patch`, and `router.delete` definition. Populate the tables below exactly as defined in your code. Do not guess or invent routes.

### G.3 Authentication Routes — `/api/auth`

**Table G.1 — Authentication Endpoints**

| Method | Endpoint | Auth Required | Min Role | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/api/auth/register` | No | Public | Register new user; triggers verification email |
| POST | `/api/auth/login` | No | Public | Credential login; issues JWT in HTTP-only cookie |
| POST | `/api/auth/verify-otp` | No | Public | Submit 2FA OTP to complete authentication |
| POST | `/api/auth/logout` | Yes | User | Clear session cookie |
| POST | `/api/auth/forgot-password` | No | Public | Send password reset email |
| POST | `/api/auth/reset-password` | No | Public | Reset password using token |
| *(add all remaining auth routes)* | | | | |

### G.4 Transaction Routes — `/api/transactions`

**Table G.2 — Transaction Endpoints**

| Method | Endpoint | Auth Required | Min Role | Description |
|--------|----------|--------------|----------|-------------|
| GET | `/api/transactions` | Yes | User | Paginated transactions with date/category filters |
| POST | `/api/transactions` | Yes | User | Create new income or expense transaction |
| PUT | `/api/transactions/:id` | Yes | User | Update transaction by ID |
| DELETE | `/api/transactions/:id` | Yes | User | Delete transaction by ID |
| GET | `/api/transactions/summary` | Yes | User | Aggregated income, expense, and balance totals |
| *(add all remaining transaction routes)* | | | | |

### G.5 Budget Routes — `/api/budgets`

**Table G.3 — Budget Endpoints**
*(Copilot: populate all routes from your budget router file)*

### G.6 Goal Routes — `/api/goals`

**Table G.4 — Goal Endpoints**
*(Copilot: populate from goals router file)*

### G.7 Bill Routes — `/api/bills`

**Table G.5 — Bill Endpoints**
*(Copilot: populate from bills router file)*

### G.8 Wallet and Transfer Routes — `/api/wallet`, `/api/transfers`

**Table G.6 — Wallet and Transfer Endpoints**

| Method | Endpoint | Auth Required | Min Role | Description |
|--------|----------|--------------|----------|-------------|
| GET | `/api/wallet/balance` | Yes | User | Retrieve current wallet balance |
| POST | `/api/transfers` | Yes | User | Initiate P2P transfer (ACID session) |
| GET | `/api/transfers` | Yes | User | Retrieve transfer history |
| POST | `/api/transfers/:id/reverse` | Yes | Admin | Reverse a completed transfer with reason |
| *(add all remaining)* | | | | |

### G.9 Analytics and ML Routes

**Table G.7 — Analytics and ML Endpoints**
*(Copilot: populate from your analytics router and the Node.js → Python ML proxy route)*

### G.10 AI Assistant Routes

**Table G.8 — Tracksy AI Assistant Endpoints**
*(Copilot: populate from your Groq integration router — include the chat endpoint and any streaming routes)*

### G.11 Admin Routes — `/api/admin`

**Table G.9 — Admin Endpoints**
*(Copilot: populate from admin router — note role protection on each route)*

---

## Appendix H — Sprint Log and Agile Backlog

### H.1 Purpose
This appendix documents the complete sprint-by-sprint development log and MoSCoW-prioritised backlog used to govern feature delivery throughout the project lifecycle.

### H.2 Instructions for Copilot
Use your GitHub Projects board, commit history, and sprint notes. Use real dates. If any deliverable below differs from what was actually built, correct it to reflect reality.

### H.3 Sprint Log

**Table H.1 — Sprint Delivery Log**

| Sprint | Dates | Primary Deliverables | Status |
|--------|-------|---------------------|--------|
| Sprint 1 | Nov 24 – Dec 7, 2025 | Project scaffolding, GitHub repository setup, JWT authentication, RBAC (User/Admin/Super Admin/Guest), email verification | Complete |
| Sprint 2 | Dec 8 – Dec 21, 2025 | Full CRUD transaction engine, 18+ expenditure categories, date-range filtering, pagination | Complete |
| Sprint 3 | Dec 22, 2025 – Jan 4, 2026 | Budget module, real-time utilisation tracking, progressive alerts at 80/90/100%, SendGrid email integration | Complete |
| Sprint 4 | Jan 5 – Jan 18, 2026 | Savings goal tracking, milestone progress indicators, contribution logging, goal completion notifications | Complete |
| Sprint 5 | Jan 19 – Feb 1, 2026 | Bill management module, recurring bill configuration, due-date tracker, automated email reminders, mark-as-paid | Complete |
| Sprint 6 | Feb 2 – Feb 15, 2026 | P2P internal wallet, ACID-compliant atomic transfers, UUID v4 idempotency, double-entry accounting, audit trail | Complete |
| Sprint 7 | Feb 16 – Mar 1, 2026 | Analytics dashboard (Recharts), financial health score algorithm, summary cards, spending pattern charts | Complete |
| Sprint 8 | Mar 2 – Mar 15, 2026 | Python ML microservice (Random Forest Regressor), 2FA email OTP, Groq LLM Tracksy assistant, Monte Carlo retirement planner, multi-currency display | Complete |
| Sprint 9 | Mar 16 – Mar 29, 2026 | Integration testing, UAT beta deployment, Lighthouse audit, Postman security tests, mobile CSS bug fixes, dark mode persistence fix | Complete |
| Sprint 10 | Mar 30 – Apr 13, 2026 | Final documentation, appendix population, deployment validation, final report submission | Complete |

### H.4 MoSCoW Backlog

**Table H.2 — MoSCoW Feature Classification**

| Priority | Feature | Sprint Delivered | Final Status |
|----------|---------|-----------------|-------------|
| Must Have | Secure user authentication (JWT + RBAC + 2FA) | Sprints 1, 8 | Delivered |
| Must Have | Transaction CRUD (18+ categories) | Sprint 2 | Delivered |
| Must Have | Budget management with progressive alerts | Sprint 3 | Delivered |
| Must Have | P2P wallet with ACID transactions | Sprint 6 | Delivered |
| Must Have | Real-time analytics dashboard | Sprint 7 | Delivered |
| Should Have | Savings goal tracking | Sprint 4 | Delivered |
| Should Have | Bill management and reminders | Sprint 5 | Delivered |
| Should Have | ML expense forecasting (Python/Scikit-Learn Random Forest) | Sprint 8 | Delivered |
| Should Have | AI assistant — Tracksy (Groq LLM API) | Sprint 8 | Delivered |
| Should Have | Monte Carlo retirement planner | Sprint 8 | Delivered |
| Should Have | Dark mode with persistence | Sprint 7 | Delivered |
| Could Have | Data export (CSV/PDF) | Sprint 9 | Delivered |
| Could Have | Multi-currency display | Sprint 8 | Delivered |
| Won't Have (this cycle) | Automated bank API sync (Plaid) | — | Intentionally excluded — privacy rationale documented in Chapter 9.2.1 |
| Won't Have (this cycle) | Native mobile app (React Native) | — | Future enhancement — documented in Chapter 11.3 |
| Won't Have (this cycle) | OCR receipt scanning | — | Future enhancement — documented in Chapter 11.3 |

---

## PART 4 — FINAL CHECKLIST FOR COPILOT

Before generating the final document, verify every item:

- [ ] All 8 appendices labelled **Appendix A through Appendix H** with consistent heading styles matching the main body
- [ ] Every appendix has a corresponding **cross-reference sentence inserted in the main body** at the exact section specified in Part 2 of this guide
- [ ] Interview questions in **Appendix A** copied **character-for-character** — no rewording whatsoever
- [ ] Survey questions in **Appendix B** copied **character-for-character** — no rewording whatsoever
- [ ] All **statistics in Appendix B** use the exact figures from the actual 36-response dataset: averages and percentages as listed in Section B.4
- [ ] **Appendix D** test results populated from **actual Jest/Vitest execution and Lighthouse/Postman runs** — no invented pass/fail values
- [ ] **Appendix E** UAT results populated from **actual beta tester Google Forms responses** — no fabricated figures
- [ ] **Appendix F** schema tables built from **actual Mongoose schema files** — every field name and type accurate
- [ ] **Appendix G** API tables built from **actual Express router files** — every route and method accurate
- [ ] **Appendix H** sprint dates and deliverables match **actual project history** — correct any discrepancy
- [ ] All figures and tables use sequential appendix-level numbering: **Table A.1, Table B.1, Figure D.1**, etc.
- [ ] Formatting (fonts, heading styles, paragraph spacing) **consistent with the main report body** throughout
- [ ] No content duplicated wholesale from the main body — **cross-reference instead**
- [ ] Main body **References list unchanged** — no references added or removed from the existing list
- [ ] Page numbers **continue sequentially** from the end of the References section
- [ ] The system described reflects the **final delivered system** (Random Forest ML, Tracksy, 2FA, Monte Carlo) — not the interim-stage prototype

---

## Appendix O — Evaluation of Software Development Methodologies

### O.1 Purpose
This appendix provides a theoretical evaluation of the software development methodologies considered for the SFT project, justifying the selection of Agile over traditional sequential models.

### O.2 Comparative Evaluation (Agile vs. Waterfall)
| Dimension | Waterfall (Sequential) | Agile (Iterative) | SFT Project Context |
|-----------|-----------------------|-------------------|---------------------|
| Requirement Stability | Assumes fixed requirements | Expects evolving requirements | **High Volatility:** ML models and AI integration were experimental. |
| Risk Management | High risk; issues found at end | Low risk; issues found early | **High Risk:** Early pivots were needed for bank API unfeasibility. |
| Stakeholder Feedback | Only at beginning and end | Continuous at every sprint | **Continuous:** Weekly supervisor reviews guided the UI/UX. |
| Speed to Market | Delayed until final phase | Incremental delivery of modules | **Rapid:** Core ledger was functional by Sprint 2. |

### O.3 Rationale for Selection
Agile was selected specifically to handle the high technical uncertainty of the Python ML microservice. The ability to "fail fast" and pivot ensured that the core transaction management functionality remained stable even as the experimental AI assistant was being refined.

---

## Appendix P — Technological Stack Specification and Evaluation

### P.1 Purpose
This appendix documents the technical evaluation performed during the architecture phase, comparing the MERN stack against alternative industry standards.

### P.2 Database Tier: MongoDB vs. Relational SQL
- **Flexibility:** MongoDB's document-based structure allowed for "Custom Categories" without complex table joins or schema migrations.
- **Scalability:** As a PFM tool, the ability to store unstructured AI conversation logs (Appendix F, Table F.7) made NoSQL a superior choice over PostgreSQL.
- **Latency:** Storing transactions as nested JSON documents minimized the impedance mismatch between the Node.js backend and the React UI.

### P.3 Backend Tier: Node.js vs. Java/Python
- **Single-Language Ecosystem:** Using JavaScript across the entire stack (React and Node) improved developer velocity and reduced context-switching.
- **Asynchronous I/O:** Node.js handled the simultaneous demands of the P2P wallet ledger, CRON reminders, and AI API proxies with high efficiency.

### P.4 Analytics Layer: Python (Scikit-Learn) Rationale
While Node.js handled the web gateway, Python was explicitly chosen for the ML microservice due to:
- **Library Maturity:** Scikit-Learn provides superior implementations of **Random Forest Regressors** compared to JS-based math libraries.
- **Model Persistence:** The ease of saving/loading models via `joblib` allowed the system to serve predictions in < 2 seconds.
- **Separation of Concerns:** Computational heavy-lifting for forecasting was isolated from the main API, ensuring that a large forecasting job never blocked a user's transaction entry.
