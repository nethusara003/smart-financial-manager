# Final Report Fix Guide
## Instructions for Gemini (Antigravity) — `10953504_Final_Report__2__finalized.docx`

> **Context:** You are editing an undergraduate Computer Science final year project report for PUSL3190 at the University of Plymouth / NSBM. The report documents the Smart Financial Tracker (SFT) — a MERN stack web application with Python ML microservices, a Groq LLM chatbot (Tracksy), P2P wallet, and Monte Carlo retirement planner. All fixes below are derived from a line-by-line compliance check against the official submission guidelines document. Work through the issues in the order listed — Critical first, then Important, then Minor.

---

## ISSUE 1 — CRITICAL: Main Body Exceeds 10,000 Word Limit

**Problem:** The main body (Chapters 01–11, excluding References and Appendices) contains approximately 11,626 words. The guidelines state the word limit is **strictly 10,000 words**. The report must be reduced by approximately **1,600–1,700 words** without losing technical substance or academic quality.

**Where to cut (suggested targets — verify word counts as you go):**

- **Chapter 1 (Introduction):** Sections 1.3 and 1.4 are verbose. Trim by ~150 words. The aim and motivation can be combined or condensed without losing meaning.

- **Chapter 2 (Background):** The stakeholder descriptions in Section 2.2 are repetitive and overly long. Trim "Future Developers and Open-Source Contributors" and condense each stakeholder to 2 sentences max. Target: ~200 word reduction.

- **Chapter 4 (Method of Approach):** Section 4.4 (Technology Stack) is a detailed list that reads more like a spec sheet than academic content. The specific version numbers (React 19.2.0, Mongoose 9.1.1, etc.) belong in the appendix, not the main body. Remove version numbers from the narrative, keep only the justification for each tool. Target: ~250 word reduction.

- **Chapter 7 (Implementation):** The three code blocks (P2P transfer, Python ML, React drag) must be **removed entirely** per Issue 3 below. This alone saves approximately 200–250 words of code content plus the removal of the surrounding "Implementation Code Snippet" headers.

- **Chapter 9 (End Project Report):** Section 9.4 (User Benefits) repeats benefits already stated in Chapter 1 and Chapter 3. Condense to 3 bullet points max. Target: ~150 word reduction.

- **Chapter 10 (Post-Mortem):** After rewriting to third person (Issue 2 below), tighten the prose. Many sentences make the same point twice. Target: ~200 word reduction.

**Instruction:** After all edits, use the Word Count tool (Review → Word Count in MS Word) with the cursor placed in Chapter 01 through to the end of Chapter 11. The count must be **10,000 or below** before submission.

---

## ISSUE 2 — CRITICAL: Chapter 10 Uses First-Person — Must Be Rewritten in Third Person

**Problem:** The submission guidelines explicitly prohibit the use of "I", "me", "my", "we". Chapter 10 (Project Post-Mortem) is written almost entirely in first person. Every sentence below must be rewritten in **past tense, third person, passive voice where possible**.

**Rewrite each of the following sentences (exact text from the report):**

---

### Section 10.2.1 — Core Framework Mastery

**Original:**
> "Prior to this project, my exposure to web development consisted primarily of isolated, front-end scripts or basic database queries."

**Replace with:**
> "Prior to the commencement of this project, the developer's exposure to web development was limited primarily to isolated front-end scripts and basic database queries."

---

**Original:**
> "I developed a deep practical understanding of the React Component Lifecycle, specifically how to manage and protect application state utilizing native hooks (useState, useEffect, useRef). I learned the critical importance of preventing unnecessary DOM re-renders..."

**Replace with:**
> "A deep practical understanding of the React Component Lifecycle was developed, specifically regarding the management and protection of application state through native hooks (useState, useEffect, useRef). The critical importance of preventing unnecessary DOM re-renders was identified early..."

---

**Original:**
> "I cultivated secure backend engineering skills. Specifically, I learned the mechanics of building stateless RESTful APIs, configuring CORS policies, and, crucially, integrating complex authentication middleware..."

**Replace with:**
> "Secure backend engineering proficiency was cultivated throughout the development cycle. The mechanics of constructing stateless RESTful APIs, configuring CORS policies, and integrating complex authentication middleware using bcrypt and JWT were applied systematically..."

---

**Original:**
> "I advanced my backend data modeling capabilities, learning how to engineer flexible NoSQL database schemas capable of handling user-defined categorization..."

**Replace with:**
> "Backend data modeling capabilities were significantly advanced, with flexible NoSQL database schemas engineered to accommodate user-defined categorization without the rigid structural constraints inherent in relational SQL systems..."

---

### Section 10.2.2 — Machine Learning and External Integrations

**Original:**
> "A significant technical leap involved stepping outside the JavaScript ecosystem to construct dedicated mathematical microservices using Python. I learned how to clean raw JSON payloads into Pandas DataFrames and practically implement Scikit-Learn RandomForestRegressor algorithms..."

**Replace with:**
> "A significant technical progression was achieved by extending development outside the JavaScript ecosystem into Python microservices. Raw JSON payloads were processed into Pandas DataFrames, and Scikit-Learn RandomForestRegressor algorithms were implemented to forecast expenditure trends from historical transaction data."

---

**Original:**
> "By integrating the Groq API to power the system's chatbot, I acquired the skills to properly handle asynchronous external API fetches, manage API rate-limiting delays within the UI efficiently..."

**Replace with:**
> "Through integration of the Groq API to power the Tracksy chatbot, skills in handling asynchronous external API fetches were acquired, alongside techniques for managing API rate-limiting delays within the UI using visual loading states, and securing private access keys via environment variables."

---

### Section 10.3 — Identifying Technological Limitations

**Original:**
> "I discovered that offloading too much heavy mathematical processing (like array filtering large transaction ledgers) to the client's browser degraded performance on weaker mobile devices. This limitation forced me to refactor the architecture, pushing the heavy data aggregation loads back onto the Node.js server..."

**Replace with:**
> "It was discovered that offloading excessive mathematical processing — such as filtering large transaction ledgers — to the client browser degraded performance on lower-specification mobile devices. This limitation necessitated an architectural refactoring, with heavy data aggregation operations relocated to the Node.js server prior to payload delivery to the React frontend."

---

### Section 10.4.1 — Agile Project Management

**Original:**
> "I learned how to break down massive, intimidating concepts (like 'Build a secure P2P wallet') into granular, two-week actionable sprints on a GitHub Kanban board. This skill of accurate time estimation, backlog prioritization, and maintaining steady momentum without burning out is highly translatable to the commercial software industry."

**Replace with:**
> "The project required the decomposition of large-scale engineering objectives — such as the construction of a secure P2P wallet system — into granular, two-week actionable sprints managed via a GitHub Kanban board. The capacity for accurate time estimation, structured backlog prioritisation, and sustained development momentum demonstrated throughout this project reflects skills directly applicable to commercial software engineering environments."

---

### Section 10.4.2 — Problem-Solving and Resilience

**Original:**
> "Tracking down a data failure where the React frontend crashed because the Node API failed to wait for the Python microservice response required systematic analysis traversing three different languages. I learned to stop blindly altering code and instead rely logically on console logs, Postman network traces, and Chrome developer tools to isolate the exact point of architectural failure."

**Replace with:**
> "Diagnosing a multi-tier data failure — wherein the React frontend crashed due to the Node.js API failing to await the Python microservice response — required systematic analysis traversing three distinct programming languages. This experience reinforced the discipline of logical fault isolation using console logs, Postman network traces, and Chrome DevTools rather than speculative code modification."

---

### Section 10.4.3 — Stakeholder Communication

**Original:**
> "Formally interviewing university peers regarding their financial stress and translating those qualitative human anxieties into rigid functional coding requirements taught me the core tenet of user-centric design: software must be engineered to solve the human problem in front of the screen, rather than just satisfying the technical curiosity of the developer behind it."

**Replace with:**
> "The formal requirements gathering process — involving structured interviews with university peers regarding financial stress — and the subsequent translation of qualitative user anxieties into concrete functional specifications reinforced the foundational principle of user-centric design: that software must be engineered to solve the human problem before the screen, rather than satisfying the technical ambitions of the engineer behind it."

---

**Also fix the section opening sentence:**

**Original (Section 10.4):**
> "The solitary nature of a final-year academic capstone project acts as an accelerated incubator not only for coding logic but for fundamental professional soft skills."

This sentence is fine stylistically but check the following sentences in 10.4 for any remaining personal pronouns and convert as above.

---

## ISSUE 3 — CRITICAL: Remove Large Code Blocks from Chapter 7

**Problem:** The guidelines state explicitly: *"Do not include significant chunks of code in your report … instead put them on the disk which is attached to the report."* Chapter 7 contains three large code blocks that must be removed from the main body.

**Action for each code block:**

### Code Block 1 — P2P Wallet Transfer (Section 7.2.1)

**Remove** everything from the line:
> `// P2P Wallet Transfer Implementation - Atomic Transaction`

down to and including:
> `};` (the closing brace of the `processTransferInternal` function)

**Replace with this single sentence after the bullet list:**
> "The complete implementation of the `processTransferInternal` function, including the full Mongoose ACID session lifecycle, is available in the project source code repository (see Appendix — Project Source Code Link)."

---

### Code Block 2 — Python ML Service (Section 7.2.2)

**Remove** everything from the line:
> `# Predictive Expenditure Forecast Implementation`

down to and including:
> `}), 200`

**Replace with:**
> "The complete Flask endpoint implementation of the `/predict` route, including the Scikit-Learn model loading and JSON payload construction, is available in the project source code repository (see Appendix — Project Source Code Link)."

---

### Code Block 3 — React Draggable Component (Section 7.2.3)

**Remove** everything from the line:
> `// Interactive Drag State Implementation - React Component`

down to and including the final closing:
> `};` (end of the `handleMouseDown` function block)

**Replace with:**
> "The complete React implementation of the draggable position controller, including the `useEffect` event listener lifecycle and `handleMouseDown` offset calculation logic, is available in the project source code repository (see Appendix — Project Source Code Link)."

---

## ISSUE 4 — CRITICAL: Add Missing Mandatory Appendices

**Problem:** The submission guidelines define a mandatory appendix sequence. Five required named appendices are entirely absent from the current report. They must be added **after** the existing Appendix H, in this exact order.

---

### Appendix I — User Guide

Add a new appendix with this exact heading: **"Appendix I — User Guide"**

Content to include:

```
Appendix I — User Guide

I.1 System Overview
The Smart Financial Tracker (SFT) is a full-stack web application deployed across 
two cloud platforms: the React frontend is hosted on Vercel, and the Node.js/Express 
backend is hosted on Render. A Python Flask ML microservice operates as a separate 
process on Render. The MongoDB database is managed via MongoDB Atlas (M0 Free Tier).

I.2 Minimum Platform Requirements (End User)
- Device: Desktop computer, laptop, tablet, or smartphone
- Browser: Google Chrome 90+, Mozilla Firefox 88+, Safari 14+, or Microsoft Edge 90+
- Internet connection: Stable broadband (minimum 5 Mbps recommended)
- Screen resolution: Minimum 1366 × 768 (responsive down to 320px width)
- No local installation required — the system runs entirely in the browser

I.3 Minimum Platform Requirements (Development / Local Deployment)
- Operating System: Windows 10+, macOS 12+, or Ubuntu 22.04+
- Node.js: Version 20.x LTS or higher
- Python: Version 3.10 or higher
- npm: Version 9.x or higher
- MongoDB: Atlas cloud account (free tier sufficient) or local MongoDB 6.0+
- RAM: 8 GB minimum (16 GB recommended)
- Storage: 10 GB free disk space minimum

I.4 Installation for Local Demonstration

Step 1 — Clone the Repository
  Clone the project repository from GitHub using the link provided in Appendix J.

Step 2 — Backend Setup
  Navigate to the /backend directory.
  Create a .env file and populate the required environment variables:
    MONGO_URI         — MongoDB Atlas connection string
    JWT_SECRET        — A secure random string for token signing
    EMAIL_USER        — SMTP email address for notifications
    EMAIL_PASS        — SMTP email password or app password
    GROQ_API_KEY      — API key from console.groq.com
  Run: npm install
  Run: npm start (starts the Express server on port 5000)

Step 3 — Python ML Microservice Setup
  Navigate to the /ml-service directory.
  Run: pip install -r requirements.txt
  Run: python app.py (starts the Flask service on port 5001)

Step 4 — Frontend Setup
  Navigate to the /frontend directory.
  Create a .env file with:
    VITE_API_URL=http://localhost:5000/api
  Run: npm install
  Run: npm run dev (starts the Vite dev server on port 5173)

Step 5 — Access the Application
  Open a browser and navigate to: http://localhost:5173
  Register a new account or use the Guest Login to explore the demo dashboard.

I.5 Key Features Available for Demonstration
- User registration and 2FA email OTP login
- Manual income and expense transaction entry (18+ categories)
- Budget management with progressive alerts at 80%, 90%, and 100%
- Peer-to-peer wallet transfers between registered users
- Savings goal tracker with milestone progress
- Bill management with CRON-based email reminders
- Real-time analytics dashboard (Recharts)
- Tracksy AI chatbot (Groq LLM — requires GROQ_API_KEY)
- ML expense forecasting (requires 3+ months of transaction history)
- Monte Carlo retirement planner
- Dark mode toggle with persistence
```

---

### Appendix J — Project Source Code Link

Add a new appendix with this exact heading: **"Appendix J — Project Source Code Link"**

Content:

```
Appendix J — Project Source Code Link

The complete project source code is hosted on Plymouth University OneDrive and is 
accessible to all evaluators via the link below. The link has been configured with 
open access permissions as required by the submission guidelines.

OneDrive Source Code Link:
[INSERT YOUR PLYMOUTH ONEDRIVE LINK HERE]

Note to Gemini: Do NOT fill in a placeholder URL. Leave the bracket above 
exactly as written — the student must paste their actual OneDrive link here 
before submission. This appendix is mandatory; failure to include a valid 
accessible link results in zero marks for the project per the submission guidelines.

The GitHub repository is provided separately in Appendix K.
```

---

### Appendix K — GitHub Repository and Commit History

Add a new appendix with this exact heading: **"Appendix K — GitHub Repository and Commit History"**

Content:

```
Appendix K — GitHub Repository and Commit History

K.1 Repository Link
GitHub Repository URL: [INSERT GITHUB REPOSITORY URL HERE]

K.2 Commit History Summary
The project was developed across 10 Agile sprints from November 2025 to April 2026, 
with all commits structured according to the Conventional Commits specification 
(feat:, fix:, docs:, refactor:). The GitFlow branching strategy was applied 
throughout, with feature branches merged into the main branch following pull 
request review at each sprint boundary.

A screenshot of the GitHub commit history graph is included below, demonstrating 
the consistent development cadence maintained across the project timeline.

[INSERT SCREENSHOT OF GITHUB COMMIT HISTORY HERE]

Note to Gemini: Insert a placeholder image caption: 
"Figure K.1: GitHub Commit History — Smart Financial Tracker (Nov 2025 – Apr 2026)"
The student must replace this with an actual screenshot before submission.
```

---

### Appendix L — Project Initiation Document (PID)

Add a new appendix with this exact heading: **"Appendix L — Project Initiation Document (PID)"**

Content:

```
Appendix L — Project Initiation Document (PID)

The Project Initiation Document (PID) was produced at the outset of the project 
to formally define the project scope, objectives, schedule, resource constraints, 
and risk management strategy. It served as the foundational governance document 
throughout the development lifecycle.

[INSERT THE FULL PID DOCUMENT CONTENT HERE, OR INSERT THE PID AS A SCANNED/EMBEDDED PAGE]

Note to Gemini: Add the heading and a single paragraph as shown above. 
The student must embed or attach the actual PID content before submission. 
If the PID exists as a separate Word document, it should be copy-pasted here 
maintaining consistent formatting. If it is a PDF scan, embed it as an image.
```

---

### Appendix M — Records of Supervisory Meetings

Add a new appendix with this exact heading: **"Appendix M — Records of Supervisory Meetings"**

Content:

```
Appendix M — Records of Supervisory Meetings

The following records document the supervisory meetings held with Ms. Yasanthika 
Mathotaarachchi throughout the project lifecycle. These records confirm the 
academic oversight and iterative feedback process that guided the development 
of the Smart Financial Tracker platform.

[INSERT MEETING RECORDS HERE]

Each entry should include:
- Date of meeting
- Medium (in-person / video call / email)
- Key discussion points
- Actions agreed
- Supervisor feedback received

Note to Gemini: Add the heading and the paragraph above. The student must 
insert the actual meeting records before submission. Format them as a table 
with columns: Date | Medium | Discussion Points | Actions | Feedback.
```

---

### Appendix N — Interim Report

Add a new appendix with this exact heading: **"Appendix N — Interim Report"**

Content:

```
Appendix N — Interim Report

The Interim Report was submitted as a formal mid-project academic deliverable 
documenting the requirements gathering process, literature review, initial 
system architecture, and early implementation progress as of March 2026.

The full interim report is included on the following pages / attached as 
a separate bound document per the submission instructions.

[The student must insert or bind the interim report here.]
```

---

## ISSUE 5 — CRITICAL: Add a Separate Bibliography Section

**Problem:** The guidelines require both a **Reference List** AND a **Bibliography**. The report currently only has one combined list titled "References". A Bibliography must be added immediately after the References section and before the Appendices.

**Action:** After the last reference entry (Xiao, J.J. and O'Neill, B., 2018), add a new section:

```
Bibliography

The following sources were consulted during background research and informed the 
conceptual development of the Smart Financial Tracker, but are not directly cited 
within the main body of the report:

Thaler, R.H. (1985) 'Mental Accounting and Consumer Choice', Marketing Science, 
4(3), pp. 199–214.

Lusardi, A. and Mitchell, O.S. (2014) 'The Economic Importance of Financial 
Literacy: Theory and Evidence', Journal of Economic Literature, 52(1), pp. 5–44.

Schwaber, K. and Sutherland, J. (2020) The Scrum Guide: The Definitive Guide to 
Scrum: The Rules of the Game. Available at: https://scrumguides.org/scrum-guide.html

Martin, R.C. (2008) Clean Code: A Handbook of Agile Software Craftsmanship. 
Upper Saddle River: Prentice Hall.

Fowler, M. (2018) Refactoring: Improving the Design of Existing Code. 2nd ed. 
Boston: Addison-Wesley Professional.
```

Note: The student may add or substitute their own additionally consulted sources here. The five above are provided as a starter — they are plausible background reading for this type of project but must be verified as genuinely consulted.

---

## ISSUE 6 — IMPORTANT: Fix Table B.2 Title Typo

**Problem:** Table B.2 is currently titled `"Demographic Breakdown (n = 3)"`. The sample size is 36, not 3.

**Find:** `Table B. 2:Demographic Breakdown (n = 3)`

**Replace with:** `Table B. 2: Demographic Breakdown (n = 36)`

---

## ISSUE 7 — IMPORTANT: Add Screenshots to Sections 6.6 and 6.7

**Problem:** Sections 6.6 and 6.7 exist as headings but contain no content — no figures, no wireframes, no screenshots. The guidelines explicitly state: *"Please put some screen shots in your main body."* These two sections are the natural place for them.

**Action for Section 6.6 — Frontend UI — Figma Wireframe Reference:**

Add the following paragraph under the heading:

> "Prior to implementation, the user interface was prototyped using Figma to establish visual hierarchy, navigation flow, and component layout. The wireframes established the foundational design language — including the sidebar navigation, card-based financial summary components, and the floating Tracksy AI widget — which were subsequently translated into the React implementation. The Figma prototype is accessible via the project source code repository link in Appendix J."

Then add a caption line:
> `[Figure 6.16: Figma Wireframe — Dashboard Layout (pre-implementation prototype)]`
> Instruct the student to insert the actual Figma screenshot here.

**Action for Section 6.7 — Real Frontend UI — Screenshot Guide:**

Add the following paragraph under the heading, then instruct the student to insert 3–4 actual screenshots:

> "The following screenshots illustrate the key user interface components of the fully deployed Smart Financial Tracker platform, demonstrating the translation of the wireframe designs into the functional React application."

Then add four captioned screenshot placeholders:
```
[Figure 6.17: SFT Login Page — 2FA Email OTP Authentication Interface]
[Figure 6.18: Main Financial Dashboard — Income, Expenses, and Budget Summary]
[Figure 6.19: Budget Management Page — Progressive Alert Indicators]
[Figure 6.20: Tracksy AI Assistant — Draggable Widget in Active Conversation]
```

Note to Gemini: Insert these captions as formatted figure caption text. The student must replace each placeholder with an actual screenshot taken from the deployed application before submission.

---

## ISSUE 8 — MINOR: Move List of Figures and Tables

**Problem:** The List of Figures and List of Tables appear embedded within the Table of Contents section rather than as a separate titled section immediately before Chapter 01.

**Action:** After the Table of Contents section ends (after the last ToC entry), insert a page break and add a new section heading:

```
List of Figures

Figure 6.1: Architecture Diagram ..................... [page number]
Figure 6.2: Use Case Diagram — Authentication & User Management ......... [page number]
Figure 6.3: Use Case Diagram — Transaction & Wallet Module .............. [page number]
Figure 6.4: Use Case Diagram — Budget Management Module ................. [page number]
Figure 6.5: Use Case Diagram — Goals, Loans and Bills Module ............ [page number]
Figure 6.6: Use Case Diagram — AI, Analytics and Planning Module ........ [page number]
Figure 6.7: Class Diagram — MongoDB Collections ......................... [page number]
Figure 6.8: Sequence Diagram — User Registration and Email Verification . [page number]
Figure 6.9: Sequence Diagram — Add Expense Transaction .................. [page number]
Figure 6.10: Sequence Diagram — Peer-to-Peer Money Transfer ............. [page number]
Figure 6.11: Sequence Diagram — Chatbot Conversation — Tracksy .......... [page number]
Figure 6.12: Sequence Diagram — Expense Forecast via ML Service ......... [page number]
Figure 6.13: Activity Diagram — User Login with 2FA Flow ................ [page number]
Figure 6.14: Activity Diagram — Budget Alert and Notification Process ... [page number]
Figure 6.15: Activity Diagram — Retirement Plan Calculation via Monte Carlo [page number]
[Add Figures 6.16–6.20 once screenshots are inserted per Issue 7]
[Add Figure K.1 once GitHub screenshot is inserted per Issue 4]

List of Tables

Table 6.1: REST API Endpoint Groups ..................................... [page number]
Table A.1: Interview Thematic Analysis Summary .......................... [page number]
Table B.1: Survey Research Parameters ................................... [page number]
Table B.2: Demographic Breakdown (n = 36) ............................... [page number]
Table B.3: Do you track your daily expenses? ............................ [page number]
Table B.4: How do you currently manage your finances? ................... [page number]
Table B.5: Financial problems commonly faced ............................ [page number]
Table B.6: How often do you forget to record expenses? .................. [page number]
Table B.7: Financial confidence rating .................................. [page number]
Table B.8: Have you used finance tracking apps before? .................. [page number]
Table B.9: Problems with existing apps .................................. [page number]
Table B.10: Most preferred features ..................................... [page number]
Table B.11: Preferred expense tracking method ........................... [page number]
Table B.12: Expected security features .................................. [page number]
Table B.13: Single most important feature ............................... [page number]
Table B.14: Would reminders help manage finances better? ................ [page number]
Table B.15: Prefer graphical reports/charts? ............................ [page number]
Table B.16: Qualitative Themes from Open-Text Feedback .................. [page number]
Table C.1: SFT Platform vs. Competitor Feature Comparison ............... [page number]
Table C.2: Pain Point Analysis and SFT Solutions ........................ [page number]
Table D.1: Unit Test Results ............................................ [page number]
Table D.2: Integration Test Results ..................................... [page number]
Table D.3: Manual System Test Results ................................... [page number]
Table D.4: Non-Functional Test Results .................................. [page number]
Table E.1: UAT Parameters ............................................... [page number]
Table E.2: UAT Survey Questions ......................................... [page number]
Table E.3: UAT Quantitative Results ..................................... [page number]
Table E.4: UAT Open-Text Themes and Outcomes ............................ [page number]
Table F.1: User Collection .............................................. [page number]
Table F.2: Transaction Collection ....................................... [page number]
Table F.3: Budget Collection ............................................ [page number]
Table F.4: Goal Collection .............................................. [page number]
Table F.5: Wallet Collection ............................................ [page number]
Table F.6: Transfer Collection .......................................... [page number]
Table F.7: Conversation Collection ...................................... [page number]
Table F.8: Retirement Plan Collection ................................... [page number]
Table F.9: Loan Collection .............................................. [page number]
Table F.10: Bill Collection ............................................. [page number]
Table G.1: User & Auth Endpoints ........................................ [page number]
Table G.2: Transaction Endpoints ........................................ [page number]
Table G.3: Budget Endpoints ............................................. [page number]
Table G.4: Goal Endpoints ............................................... [page number]
Table G.5: Bill Endpoints ............................................... [page number]
Table G.6: Loan Endpoints ............................................... [page number]
Table G.7: Wallet and Transfer Endpoints ................................ [page number]
Table G.8: Analytics and Intelligence Endpoints ......................... [page number]
Table G.9: Backoffice Endpoints ......................................... [page number]
Table H.1: Sprint Delivery Log .......................................... [page number]
Table H.2: MoSCoW Feature Classification ................................ [page number]
```

Note to Gemini: Insert the List of Figures and List of Tables as a proper formatted section with the heading styled consistently with the rest of the document. Page numbers should be inserted using Word's cross-reference field codes so they update automatically, but placeholder `[page number]` text is acceptable if field codes are not supported — the student can update them in Word using Update Fields (F9) before printing.

---

## FINAL CHECKLIST FOR GEMINI

After completing all edits, verify each item before saving:

- [ ] Main body word count is **10,000 or below** (Chapters 01–11 only)
- [ ] Chapter 10 contains **zero instances** of "I ", "my ", "I've", "I learned", "I cultivated", "I developed", "I discovered", "I acquired"
- [ ] **All three code blocks removed** from Chapter 7 and replaced with the one-sentence cross-references provided
- [ ] **Table B.2 title** reads `n = 36` not `n = 3`
- [ ] **Bibliography** section added after References, before Appendices
- [ ] **Appendix I (User Guide)** added with full installation content
- [ ] **Appendix J (Source Code Link)** added with the `[INSERT LINK HERE]` placeholder preserved
- [ ] **Appendix K (GitHub Repo + Commit History)** added with figure placeholder
- [ ] **Appendix L (PID)** added with placeholder
- [ ] **Appendix M (Supervisory Meeting Records)** added with placeholder
- [ ] **Appendix N (Interim Report)** added with placeholder
- [ ] **Sections 6.6 and 6.7** contain descriptive paragraphs and figure caption placeholders
- [ ] **List of Figures and List of Tables** appear as a separate titled section before Chapter 01
- [ ] All appendix labels in the Table of Contents updated to include I through N
- [ ] Document saved and formatting is consistent throughout (heading styles, font, spacing)

---

## NOTE ON ITEMS GEMINI CANNOT FILL

The following items require the student's own real content and must be inserted **manually by the student** after Gemini completes all other edits:

1. **Appendix J** — The actual Plymouth OneDrive source code link
2. **Appendix K** — The actual GitHub URL and a real screenshot of the commit history
3. **Appendix L** — The actual PID document content
4. **Appendix M** — The actual supervisory meeting records/minutes
5. **Appendix N** — The actual interim report (bound or embedded)
6. **Sections 6.6 and 6.7** — Actual Figma wireframe screenshot and actual UI screenshots from the deployed application
7. **List of Figures/Tables** — Actual page numbers (update via Word's F9 / Update Fields after all content is finalized)

These placeholders are clearly marked in the document with `[INSERT ... HERE]` text so the student knows exactly where each item goes.
