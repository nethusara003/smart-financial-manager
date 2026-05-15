# SFT Final Report — Required Changes Checklist
> Based on Plymouth University Final Report Guidelines  
> Supervisor instruction: Keep representative examples in the main body; move bulk material to appendices with cross-references.

---

## PART 1 — GLOBAL STYLE FIXES (Apply Everywhere)

These must be fixed throughout the **entire** main body before any other work.

| # | Issue | Fix Required |
|---|-------|-------------|
| G1 | First-person pronouns (`I`, `me`, `my`, `the developer`) used throughout post-mortem and implementation chapters | Replace with passive voice: "skills were developed," "the architecture was refactored," "it was determined that…" |
| G2 | Present tense used in descriptions ("the system provides," "the algorithm checks") | Rewrite in past tense: "the system provided," "the algorithm checked" |
| G3 | Sentences exceeding 30 words found in multiple chapters | Break into shorter sentences; max ~25–28 words per sentence |
| G4 | Scaffolding/developer notes left in the document (e.g., "keep only 2," "Tzble of abbrivation—border eka penna danna epa," "cross reference," "summary," "Methnt wenkl roman number") | Delete all of these before submission |
| G5 | Placeholder screenshot captions (Figures 6.16–6.20 all say "Note: The student must insert…") | Replace with actual screenshots from the deployed application |
| G6 | Chapter summaries missing from Chapters 3, 4, 5, 6, 7, and 8 | Add a closing paragraph to each chapter summarising what was covered and bridging to the next chapter |

---

## PART 2 — CHAPTER NUMBERING & STRUCTURE

### 2.1 Renumber All Chapters

Your current numbering skips and conflicts. Proposed correct order:

| New # | Chapter Title | Status |
|-------|--------------|--------|
| Chapter 1 | Introduction | ✅ Keep as-is (fix style) |
| Chapter 2 | Background, Objectives & Deliverables | ⚠️ Remove use case diagrams (move to Design) |
| Chapter 3 | Literature Review | ⚠️ Fix broken section numbering |
| Chapter 4 | Method of Approach | ⚠️ Remove duplicate requirements content |
| Chapter 5 | Requirements | ⚠️ Move algorithm specs to Implementation |
| Chapter 6 | System Design | ⚠️ Replace all screenshot placeholders |
| Chapter 7 | Implementation | ⚠️ Remove inline code blocks |
| Chapter 8 | Testing & Evaluation | ⚠️ Cut full test table to appendix |
| Chapter 9 | End-Project Report | ⚠️ Fix Objective 5 mismatch |
| Chapter 10 | Project Post-Mortem | ⚠️ Rewrite in third person; add critical reflection |
| Chapter 11 | Conclusions | ⚠️ Trim significantly — remove repetition |

---

## PART 3 — CHAPTER-BY-CHAPTER REQUIRED CHANGES

---

### Chapter 1 — Introduction
- [ ] **G1/G2:** Rewrite Section 1.5 (Overview of the Report) in past tense, third person. Currently reads as a prospectus ("This chapter will establish…") — change to ("Chapter 2 examined…", "Chapter 3 reviewed…")
- [ ] **Remove** the scaffolding text block that appears between the scope section and Chapter 1 heading (`"summary / cross reference / system architecture / project summary"`)
- [ ] Add Chapter Summary at end of Chapter 1 if not already present

---

### Chapter 2 — Background, Objectives & Deliverables
- [ ] **Move** the Use Case Diagrams (Section 2.4.2 / Figures showing use case UML) out of this chapter and into **Chapter 6 (System Design)**. Chapter 2 should only contain background context, objectives, stakeholders, and a deliverables list.
- [ ] **Fix** the Chapter Summary at the end of Chapter 2 — it currently says "Chapter 3 presents the System Design" but Chapter 3 is actually the Literature Review. Rewrite the transition sentence correctly.
- [ ] The deliverables section (2.4) is well structured — keep as-is.

---

### Chapter 3 — Literature Review

**Critical numbering fix required:**

- [ ] You currently have **three sections all labelled "3.3"** (Gap 1, Gap 2, Gap 3 — Behavioural, Analytical, Ecosystem). Renumber as follows:

```
3.1  Introduction to PFM Systems
3.2  Competitive Analysis
  3.2.1  YNAB
  3.2.2  Mint / Credit Karma
  3.2.3  PocketGuard
3.3  Identified Research Gaps
  3.3.1  Gap 1 — Behavioural Support
  3.3.2  Gap 2 — Analytical and Predictive Gap
  3.3.3  Gap 3 — Ecosystem Fragmentation
3.4  Synthesis of the Literature
3.5  Chapter Summary        ← ADD THIS (currently missing)
```

- [ ] Add **Chapter Summary** at the end (currently the chapter ends abruptly after the synthesis paragraph)

---

### Chapter 4 — Method of Approach

- [ ] **Remove Section 4.5 entirely** (Requirements Gathering Techniques — semi-structured interviews, questionnaires, observation, document review). This is a **direct duplicate** of Sections 5.3.1–5.3.4 in Chapter 5. The guidelines explicitly state: *avoid unnecessary repetition.* Either:
  - Keep the techniques described in Chapter 5 only, OR
  - Keep a one-paragraph summary in Chapter 4 that says "Requirements were gathered using four techniques; full details are provided in Chapter 5 and Appendix A and B."
- [ ] **Add Chapter Summary** at end of Chapter 4

---

### Chapter 5 — Requirements

- [ ] **Move Section 5.4** (Core Algorithm Specifications — Random Forest, Linear Regression, Budget Threshold) to **Chapter 7 (Implementation)**. Algorithm specifications are implementation detail, not requirements.
- [ ] Add **Chapter Summary** at end of Chapter 5

---

### Chapter 6 — System Design

#### 6.1 Screenshots — MANDATORY
- [ ] Replace **all six screenshot placeholders** (Figures 6.16–6.20) with actual screenshots from the deployed application. This is non-negotiable per the guidelines ("please put some screenshots in your main body").

#### 6.2 Sequence Diagrams — Apply Supervisor Instruction
Per supervisor instruction: keep 2 examples in the main body, move the rest to an appendix with explanations and cross-references.

- [ ] **Keep in main body (Chapter 6):**
  - Figure 6.8 — User Registration and Email Verification
  - Figure 6.9 — Add Expense Transaction
- [ ] **Move to Appendix** (create a new **Appendix P — Additional Sequence Diagrams**):
  - Figure 6.10 — Peer-to-Peer Money Transfer
  - Figure 6.11 — AI Chatbot Conversation (Tracksy)
  - Figure 6.12 — Expense Forecast via ML Service
- [ ] **Add cross-reference in Chapter 6** after the two kept diagrams:
  > *"The remaining sequence diagrams covering the P2P Transfer, AI Chatbot, and ML Forecasting workflows are provided in Appendix P."*

#### 6.3 Activity Diagrams — Apply Supervisor Instruction
- [ ] **Keep in main body:** Figure 6.13 (User Login with 2FA) — most central to the system
- [ ] **Move to Appendix P** (alongside sequence diagrams): Figures 6.14 and 6.15
- [ ] **Add cross-reference in Chapter 6:**
  > *"Activity diagrams for the Budget Alert process and Retirement Plan Calculation are provided in Appendix P."*

#### 6.4 Other
- [ ] Add **Chapter Summary** at end of Chapter 6

---

### Chapter 7 — Implementation

- [ ] **Remove all inline code blocks.** The guidelines state: *"Do not include significant chunks of code in your report."* For each of the three algorithm sections (P2P Wallet, ML Forecasting, Draggable AI):
  - Keep the **Algorithm Flow Description** (the numbered bullet list) — this is acceptable high-level explanation
  - Keep the **annotated pseudocode figure image** if it is a diagram/flowchart
  - **Delete** the literal code snippet blocks (the JavaScript and Python `code` formatted blocks)
  - **Add cross-reference** after each section:
    > *"The complete implementation of `processTransferInternal`, including the full Mongoose ACID session lifecycle, is available in the project source code repository (Appendix J)."*

- [ ] **Move the Algorithm Specifications** from Chapter 5 into this chapter (Section 7.2 or a new 7.3).
- [ ] Add **Chapter Summary** at end of Chapter 7

---

### Chapter 8 — Testing & Evaluation

#### 8.1 Full Test Case Table — Apply Supervisor Instruction
The table of 24 test cases (TC-001 to TC-024) is too voluminous for the main body.

- [ ] **Keep in main body** (as examples, one per test type):
  - TC-007 or TC-008 — Budget threshold (System test) ← already shown in Section 8.4 ✅
  - TC-010 — P2P Atomic Integrity (Unit/Integration) ← already shown in Section 8.2 ✅
  - TC-019 — JWT No Token Access (Security) ← already shown in Section 8.6.2 ✅
  - TC-013 — ML Forecasting Recursive Logic (Integration) ← already shown in Section 8.3 ✅
- [ ] **Move the full TC-001 to TC-024 table to Appendix D** (it already belongs there per your appendix structure)
- [ ] **Add cross-reference in Chapter 8** after each test section:
  > *"Full documented results for all unit tests are provided in Appendix D (Table D.1)."*  
  > *"Complete integration test results are provided in Appendix D (Table D.2)."*  
  > *"The full manual system test case suite (TC-001 to TC-024) is documented in Appendix D (Table D.3)."*

#### 8.2 Pending Results — Must Be Completed
- [ ] Complete all manual system tests in **Appendix D, Table D.3** — currently all show "Pending manual execution"
- [ ] Run **Google Lighthouse** audit and populate real scores in **Appendix D, Table D.4** (currently all "Pending")
- [ ] Populate **Appendix E UAT results** — all scores currently show "X.X / 5" placeholders

- [ ] Add **Chapter Summary** at end of Chapter 8

---

### Chapter 9 — End-Project Report

- [ ] **Fix Objective 5 mismatch:** "Objective 5 (Unachieved)" describes bank API integration, but this objective does not appear anywhere in Chapter 2's objectives list. Fix by either:
  - Adding it to Chapter 2 under a "Won't Have" scoped item, OR
  - Reframing it in Chapter 9 as a **scope change** rather than a failed objective: *"During Sprint 3, automated bank API synchronisation was re-evaluated and removed from scope due to legal, technical, and privacy constraints identified during requirements gathering."*
- [ ] Rewrite any remaining first-person constructions in passive/third person
- [ ] Add Chapter Summary (optional but consistent with other chapters)

---

### Chapter 10 — Post-Mortem

- [ ] **Rewrite entirely in third person / passive voice.** This chapter currently has the highest density of first-person language. Examples of required changes:

| Current (Incorrect) | Replace With |
|---------------------|-------------|
| "I discovered that…" | "It was discovered that…" |
| "my exposure to web development" | "prior exposure to web development was limited…" |
| "the developer's experience" | "proficiency was developed in…" |
| "I applied optimised useEffect" | "optimised useEffect dependency tracking was applied…" |

- [ ] **Add critical reflection** on the following (currently missing — guidelines require it):
  - Was **Agile** the right development process for this project? What would Waterfall have done differently?
  - Were the **MERN stack** technology choices optimal? What limitations did they introduce?
  - Were the **project objectives** the right ones to adopt in the first place?
- [ ] Add Chapter Summary

---

### Chapter 11 — Conclusions

- [ ] **Trim significantly.** The current conclusions re-summarise every feature built — this repeats Chapter 9. Guidelines say: *"Final, brief, summarising conclusions."* Target length: 400–600 words maximum.
- [ ] Structure it as:
  1. One paragraph: restate the core problem addressed
  2. One paragraph: what was achieved and how it maps to objectives
  3. One paragraph: key limitations
  4. One paragraph: future work pointer (Section 11.3 can remain but trim it)
- [ ] No Chapter Summary needed here (it is the conclusion)

---

## PART 4 — APPENDIX RESTRUCTURE

### 4.1 Mandatory Order (Per Guidelines)

The guidelines specify a **fixed order** for appendices. Your current order does not match. Renumber all appendices as follows:

| New Label | Content | Current Label | Action |
|-----------|---------|---------------|--------|
| Appendix A | User Guide | Appendix I | Renumber |
| Appendix B | Project Source Code Link | Appendix J | Renumber |
| Appendix C | GitHub Commit History & Repo Link | Appendix K | Renumber |
| Appendix D | PID | Appendix L | Renumber + **POPULATE** |
| Appendix E | Interim Report | Appendix N | Renumber + **INSERT** |
| Appendix F | Records of Supervisory Meetings | Appendix M | Renumber + **POPULATE** |
| Appendix G | Interview Research Materials | Appendix A | Renumber |
| Appendix H | Quantitative Survey & Results | Appendix B | Renumber |
| Appendix I | Competitive Analysis | Appendix C | Renumber |
| Appendix J | Full System Test Results | Appendix D | Renumber + **COMPLETE** |
| Appendix K | UAT Survey & Results | Appendix E | Renumber + **COMPLETE** |
| Appendix L | MongoDB Schema Reference | Appendix F | Renumber |
| Appendix M | API Endpoint Reference | Appendix G | Renumber |
| Appendix N | Sprint Log & Agile Backlog | Appendix H | Renumber |
| Appendix O | Additional Sequence & Activity Diagrams | *NEW* | **CREATE** |
| Appendix P | Technology & Methodology Justification | *NEW* | **CREATE** |

> ⚠️ After renumbering, update **every in-text cross-reference** in the main body to use the new labels.

---

### 4.2 Appendices That Must Be Populated (Currently Empty Placeholders)

| Appendix | Required Content | Current Status |
|----------|-----------------|----------------|
| D (new) — PID | Full Project Initiation Document | Empty placeholder |
| E (new) — Interim Report | Bound interim report | Empty placeholder |
| F (new) — Supervisory Meetings | Meeting records with: date, medium, discussion points, agreed actions, supervisor feedback | Empty placeholder |
| J (new) — Full Test Results | Complete TC-001 to TC-024 table; Lighthouse scores; all "Pending" items resolved | Partially populated |
| K (new) — UAT Results | All "X.X / 5" scores replaced with real data from beta testers | Partially populated |

---

### 4.3 New Appendices to Create

#### Appendix O — Additional Sequence & Activity Diagrams
Create this appendix to receive the diagrams moved from Chapter 6. Structure:

```
Appendix O — Additional Sequence & Activity Diagrams

O.1  Purpose
     These diagrams supplement the two sequence diagrams presented in
     Chapter 6 (Section 6.4). They document the remaining key system
     workflows of the Smart Financial Tracker platform.

O.2  Sequence Diagram — Peer-to-Peer Money Transfer
     [Insert Figure]
     Brief explanation (2–3 sentences on what the diagram shows)

O.3  Sequence Diagram — AI Chatbot Conversation (Tracksy)
     [Insert Figure]
     Brief explanation

O.4  Sequence Diagram — Expense Forecast via ML Service
     [Insert Figure]
     Brief explanation

O.5  Activity Diagram — Budget Alert and Notification Process
     [Insert Figure]
     Brief explanation

O.6  Activity Diagram — Retirement Plan Calculation via Monte Carlo
     [Insert Figure]
     Brief explanation
```

#### Appendix P — Technology & Methodology Justification
This appendix is referenced but does not exist (Chapter 4 refers to "Appendix X" and "Appendix Y"). Create it:

```
Appendix P — Technology & Methodology Justification

P.1  Development Methodology Comparison (Agile vs. Alternatives)
     Theoretical comparison of Agile, Waterfall, and Spiral models.
     Justification for Agile selection in context of this project.

P.2  Technology Stack Justification
     Comparative justification for:
     - MongoDB vs. relational SQL alternatives
     - React vs. Angular / Vue
     - Node.js/Express vs. Django / Spring Boot
     - Python Flask microservice vs. native Node ML libraries
     - Groq/LLaMA vs. OpenAI API
```

---

### 4.4 Appendix Quality Rules (Per Guidelines)

The guidelines state: *"The quality of presentation in the appendices should be as good as in the main body. Furthermore, the appendices are not a dumping ground."*

Apply these rules to every appendix:

- [ ] Every appendix must have a **Purpose section** (O.1, P.1 pattern) explaining why it exists
- [ ] Every appendix must be **cited at least once** in the main body — if it isn't referenced anywhere, remove it
- [ ] Every appendix that receives moved content from the main body must be introduced in the main body with a **cross-reference sentence**
- [ ] Tables and figures inside appendices must have **proper captions** (Table X.Y: Description)
- [ ] The same **style rules** apply: past tense, third person, no first-person pronouns

---

## PART 5 — CROSS-REFERENCE MASTER LIST

Every time content was moved from the main body to an appendix, a cross-reference sentence must appear at the point of removal. Use this as a checklist:

| Location in Main Body | Content Moved To | Cross-Reference Sentence to Add |
|-----------------------|-----------------|----------------------------------|
| Chapter 3 — after competitive analysis tables | Appendix I (Competitive Analysis) | *"A full structured competitive feature matrix comparing SFT against YNAB, PocketGuard, Mint, and Monarch Money across 14 dimensions is provided in Appendix I."* |
| Chapter 4 — after methodology section | Appendix P (Methodology Justification) | *"A detailed theoretical comparison of Agile against sequential and spiral process models is provided in Appendix P."* |
| Chapter 4 — after technology stack paragraph | Appendix P | *"Full justification for each technology selection over competing alternatives is documented in Appendix P."* |
| Chapter 5 — after requirements listing | Appendix G (Interview Materials) | *"The full interview protocol, question set, and thematic findings from the 26 stakeholder interviews are provided in Appendix G."* |
| Chapter 5 — after survey findings | Appendix H (Survey Results) | *"The complete survey instrument and full statistical results (n=36) are provided in Appendix H."* |
| Chapter 6 — after kept sequence diagrams | Appendix O | *"The remaining sequence diagrams — covering the P2P Transfer, Tracksy AI Chatbot, and ML Forecasting workflows — are provided in Appendix O."* |
| Chapter 6 — after kept activity diagram | Appendix O | *"Activity diagrams for the Budget Alert process and Retirement Plan Calculation via Monte Carlo are provided in Appendix O."* |
| Chapter 6 — after API structure table | Appendix M (API Endpoint Reference) | *"A complete API endpoint reference, including HTTP methods, authentication requirements, and role constraints for all 14 modules, is provided in Appendix M."* |
| Chapter 6 — after class diagram | Appendix L (MongoDB Schema) | *"Full field-level schema definitions for all MongoDB collections, including data types, constraints, and relationship notes, are provided in Appendix L."* |
| Chapter 7 — after each algorithm section | Appendix B (Source Code) | *"The complete implementation of [function name] is available in the project source code repository (Appendix B)."* |
| Chapter 8 — after unit test summary | Appendix J (Test Results) | *"Full unit test results for all 140 backend test cases are provided in Appendix J (Table J.1)."* |
| Chapter 8 — after integration test summary | Appendix J | *"Complete integration test results across all six integration points are provided in Appendix J (Table J.2)."* |
| Chapter 8 — after system test summary | Appendix J | *"The complete manual system test suite (TC-001 to TC-024) is documented in Appendix J (Table J.3)."* |
| Chapter 8 — after UAT section | Appendix K (UAT Results) | *"The UAT survey instrument and aggregated beta tester feedback are provided in Appendix K."* |
| Chapter 8 — after non-functional tests | Appendix J | *"The full Lighthouse audit report and security test results are provided in Appendix J (Table J.4)."* |
| Chapter 4 — after sprint management section | Appendix N (Sprint Log) | *"A complete sprint-by-sprint delivery log and the full MoSCoW feature classification are provided in Appendix N."* |

---

## PART 6 — QUICK PRIORITY ORDER

Do these in this sequence to avoid rework:

1. **Fix all global style issues (G1–G6)** — tense, person, sentence length, remove scaffolding notes
2. **Add all missing Chapter Summaries** (Chapters 3–8)
3. **Replace all screenshot placeholders** in Chapter 6 with real images
4. **Remove duplicate content** — delete Section 4.5 (duplicate of Chapter 5)
5. **Move algorithm specs** from Chapter 5 to Chapter 7; remove code blocks from Chapter 7
6. **Apply supervisor instruction on diagrams** — keep 2 sequence + 1 activity in Chapter 6; create Appendix O for the rest; add cross-references
7. **Apply supervisor instruction on test cases** — keep 4 example rows in Chapter 8; full table goes to Appendix J; add cross-references
8. **Renumber all appendices** to match the mandatory order
9. **Populate empty appendices** — PID, supervisory meetings, UAT scores, test results
10. **Create new appendices** O and P
11. **Update all cross-reference labels** in the main body to match new appendix letters
12. **Final check** — verify every appendix is cited at least once in the main body

---

*Last updated: May 2026 | Based on Plymouth University Final Report Guidelines*
