# Smart Financial Tracker - Comprehensive Final Report Draft Data

This document aggregates all information, data, concepts, and research findings from the Project Proposal, Project Initiation Document (PID), Interim Report, and Abstract into the finalized Final Year Project (FYP) report structure.

---

## Abstract
The contemporary financial landscape is characterized by rapid transition toward digital ecosystems, where cashless transactions and subscription-based services have significantly reshaped consumer behavior, minimizing the physical awareness of spending (an "invisible economy"). While providing convenience, this has introduced challenges in financial self-regulation, resulting in fragmented financial visibility and reduced control over personal cash flow. Existing tools typically address these needs in isolation with a heavy focus on automation, limiting active engagement. 

This study aimed to design, develop, and evaluate the Smart Financial Tracker (SFT), a full-stack MERN web application integrating multi-technique expense forecasting, a machine learning-driven retirement planning engine, and a large language model-based financial awareness assistant. The SFT platform emphasizes active financial engagement through structured manual recording and interactive data visualization. 

Expense forecasting was implemented using linear regression for trend detection and a weighted moving average hybrid model, validated through rolling window backtesting. The retirement planning module combined deterministic projection, Monte Carlo simulation, and a Random Forest Regressor. The AI assistant queried a Groq-hosted large language model to deliver informational financial awareness guidance. System evaluation was conducted through backend unit and integration tests using Jest, frontend component tests using Vitest, and end-to-end workflow tests using Playwright. 

---

## Chapter 01 – Introduction

### 1.1 Project Background
Personal financial management has become an essential competency within the modern digital economy. Individuals are increasingly responsible for managing multiple income sources, recurring expenses, digital subscriptions, and short-term financial commitments. The widespread adoption of cashless transactions and online payment platforms has increased convenience but removed the psychological friction of spending (payment decoupling). This limited financial visibility leads to ineffective budgeting and financial stress.

**Problem Statement / Problem Definition:**
Contemporary personal finance management suffers from limited visibility due to structural weaknesses in traditional tracking approaches:
1. **Data Integrity:** Spreadsheets are prone to formula errors and data loss, leading to inaccurate assessments.
2. **Predictive Insight:** Traditional tools lack forecasting capabilities, causing an inability to anticipate financial strain.
3. **User Experience:** Commercial applications are frequently feature-heavy and complex, leading to user abandonment.
4. **Collaboration:** Single-user systems lack integrated P2P functionality, making it difficult to manage shared expenses.
5. **Proactivity:** Alerts occur only after budget limits are exceeded, reducing opportunities for midcycle behavioral correction.

### 1.2 Motivation
The motivation is rooted in the significant societal costs associated with financial mismanagement, including high consumer debt and low rates of financial literacy. The primary purpose is to empower regular users with pro-level tools, addressing the dichotomy where financial tools are either overly simplistic or unnecessarily complex. SFT actively empowers the user to move from reactive financial logging to proactive planning.

### 1.3 Aim
The aim of this project is to architect, develop, and deploy a secure, scalable, and user-centric MERN-based personal finance management system that leverages real-time data visualization, statistical predictive analytics, and adaptive recommendations to empower users to safely track, categorize, and optimize their finances.

### 1.4 Objectives
*   **Objective 1:** To develop a comprehensive web application for creating, viewing, updating, and deleting income and expense records across distinct categories in a structured manner.
*   **Objective 2:** To implement an intelligent budgeting mechanism with progressive threshold alerts at 80%, 90%, and 100% utilization levels to prevent overspending.
*   **Objective 3:** To integrate predictive analytics using statistical linear regression algorithms and Machine Learning to forecast expenditure trends explicitly.
*   **Objective 4:** To establish a secure internal wallet system enabling peer-to-peer (P2P) transfers with transactional atomicity and complete audit trails.
*   **Objective 5:** To deploy multi-tier security through role-based access control (Super Admin, Admin, User, Guest) and JWT authentication mechanisms to protect data integrity.
*   **Objective 6:** To complete system development, testing (Jest, Vitest, Playwright), deployment, and documentation within the defined project schedule ensuring readiness for final academic evaluation.

### 1.5 Scope and Limitations
**Included Scope:**
*   Manual recording of income and expense transactions in a structured manner.
*   Deep customization engine for categorizing financial records to better organize spending behavior.
*   Weekly and monthly budgets with progressive threshold monitoring.
*   Real-time financial summaries and dynamic, interactive visual dashboards.
*   Secure user authentication (JWT) and stateless session management.
*   Adaptive intelligence layer providing contextual alerts and LLM-based recommendations.

**Limitations:**
*   Does not integrate with banks or external financial services for automatic transaction imports due to API dependency risks and behavioral goals.
*   Advanced financial features such as multi-currency transaction storage, real-time stock market tracking, and loans are excluded.
*   Provides non-prescriptive informational guidance, not certified or regulated financial investment advice.

---

## Chapter 02 – Background, Objectives and Deliverables

### 2.1 Background
The contemporary financial landscape requires active cognitive involvement in financial tracking to enhance accountability. Behavioral finance research demonstrates that manual transaction entry increases awareness of expenditure patterns and reduces the likelihood of impulsive decisions driven by present bias. SFT restores cognitive awareness of spending while providing analytical power.

### 2.2 Stakeholders
1. **End Users:** Individuals who use the system to track and manage personal finances (focusing on university students and early-career professionals).
2. **Project Developer:** Responsible for design, implementation, testing, and documentation.
3. **Project Supervisor:** Provides academic guidance and ensures technical correctness.
4. **Academic Institution (NSBM / Plymouth University):** Oversees assessment quality.
5. **Future Developers:** Potential contributors for system enhancement.

---

## Chapter 03 – Requirements

### 3.1 Requirements Gathering Techniques
A mixed-methods research approach was adopted, incorporating literature review, stakeholder interviews, and competitive benchmarking.
*   **Interviews:** Semi-structured interviews conducted with 26 stakeholders: 15 university students (19-24), 8 early-career professionals, and 3 financial educators over domains of tracking practices, pain points, features, and privacy.
*   **Key Findings:**
    *   73% of students preferred manual tracking due to privacy/bank integration concerns.
    *   90% reported dissatisfaction with existing reactive notifications.
    *   87% utilized separate applications for budgeting/P2P transfers.
    *   68% underestimated recurring subscription costs (miscalculated by 34%).

### 3.2 Tools Used
*   MongoDB
*   Express.js
*   React.js
*   Node.js
*   Jest & Vitest (Testing)
*   Playwright (E2E Testing)

---

## Chapter 04 – Method of Approach

### 4.1 Software Development Methodology & Tools
**Main Methodology:** Agile
The MERN stack provides the ideal monolithic, single-language framework for agility and performance:
*   **Frontend (React.js):** Component-based, responsive, dynamic UI.
*   **Backend (Node.js + Express.js):** Core business logic, non-blocking asynchronous I/O.
*   **Database (MongoDB):** Flexible NoSQL document store allowing user-defined category structures and alert configurations.
*   **Predictive Layer:** Linear regression algorithms and Weighted Moving Average.

---

## Chapter 05 – Literature Review

### 5.1 Review of Similar Systems
Personal Financial Management (PFM) systems support monitoring, but sustained adoption is inconsistent. Long-term usage relies heavily on usability. Applications perceived as complex are abandoned (Kim et al., 2003).

#### 5.1.1 Mint
*   **Overview:** Relies on automated bank synchronization.
*   **Limitation/Gap:** API Dependency Risk. Heavy reliance on external banking APIs limits usability in regions with restricted access and introduces data syncing delays. This delayed insight prevents true real-time updates.

#### 5.1.2 YNAB (You Need A Budget)
*   **Overview:** Utilizes a zero-based budgeting methodology.
*   **Limitation/Gap:** Steep Learning Curve. Imposes a rigid financial philosophy, proving exclusionary for beginners.

#### 5.1.3 PocketGuard
*   **Overview:** Focuses on expense alerts and basic categorization.
*   **Limitation/Gap:** Static Analysis. Lacks deep, customizable analytics or personalized recommendations to drive behavioral change.

*(Note: Data for Chapters 6 to 11 are derived natively from ongoing software implementation and post-mortem evaluation based on the instructions.)*