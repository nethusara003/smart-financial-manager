# PUSL 3190 – Computing Project Final Report

> **Usage Note for GitHub Copilot:** This file defines the complete structure and content requirements for the Final Year Project report. Each section below corresponds to a chapter or report element. Use these as headings, subheadings, and guidance notes to generate the full report. Replace all `[PLACEHOLDER]` text with actual project content. Do not remove any section — every item listed here is required.

---

## Report Structure Overview

| Element | Description |
|---|---|
| Title Page | Project title, student name, Plymouth ID, module code, supervisor name, submission date, Plymouth University details (use given template) |
| Acknowledgement | Single page, several paragraphs — thank supervisor, academic staff (NSBM & Plymouth), family, friends |
| Abstract | Single paragraph, 200–350 words — problem, aim, main solution, technologies used, main outcome, how tested |
| Table of Contents | Auto-generated |
| List of Figures & Tables | Tables numbered as `2.1`, `2.2` etc. with caption **above** the table; Figures numbered as `2.1`, `2.2` etc. with caption **below** the figure |
| List of Abbreviations | All short-form words used in the report, in **alphabetical order** |
| Main Body (Chapters 01–11) | See chapters below |
| List of References | All cited sources |
| Appendices (A, B, C, D…) | Supporting documents — see Appendix section |

> **Word Count:** Introduction (Chapter 01) through Conclusion (Chapter 11) must total approximately **10,000 words**.

---

## Title Page

- Project Title: `[PROJECT TITLE]`
- Student Name: `[STUDENT NAME]`
- Plymouth Student ID: `[PLYMOUTH ID]`
- Module Code: PUSL 3190
- Supervisor Name: `[SUPERVISOR NAME]`
- Submission Date: `[DATE]`
- Plymouth University / NSBM Green University

---

## Acknowledgement

> Single page. Write several short, polite paragraphs.

- Thank your supervisor for the guidance, feedback, and support provided.
- Thank all academic staff at NSBM and Plymouth University.
- Thank your family, friends, and anyone else who helped.

---

## Abstract

> Single paragraph. 200 words minimum, 350 words maximum.

Cover the following points in the paragraph:
- Your problem statement
- Aim of the project
- Your main solution
- Technologies that you used
- Main outcome
- How you tested it

---

## Table of Contents

`[Auto-generated — list all chapters and sub-sections with page numbers]`

---

## List of Figures & Tables

- **Tables:** Numbered by chapter (e.g., Table 2.1, Table 2.2). Caption placed **above** the table.
- **Figures:** Numbered by chapter (e.g., Figure 2.1, Figure 2.2). Caption placed **below** the figure.
- **Equations & Algorithms:** Must also be named/numbered.

---

## List of Abbreviations

> All abbreviations used in the report listed in **alphabetical order**.

| Abbreviation | Full Form |
|---|---|
| `[e.g., API]` | `[Application Programming Interface]` |
| `[Add all abbreviations used]` | |

---

---

# Main Body

---

## Chapter 01 – Introduction

### 1.1 Project Background *(Sub-topic)*

- General explanation of the area of the problem.
- Problem Statement.

### 1.2 Motivation

- Why you selected this particular project/problem.
- Main purpose of solving this problem.

### 1.3 Aim

> Write as a **single sentence**:
> *"The aim of this project is to `[...]` with the help of `[technologies]`."*

### 1.4 Objectives

> Must follow the **SMART** criteria:
> - **S** – Specific
> - **M** – Measurable (within 6 or 3 months)
> - **A** – Achievable (practically achieved)
> - **R** – Relevant
> - **T** – Time-bound
>
> Each objective should begin with **"To"** and state something specific that can be measured.

- Objective 1: `[...]`
- Objective 2: `[...]`
- Objective 3: `[...]`
- *(Add more as needed)*

### 1.5 Scope

- Functions that you have already completed / plan to complete.
- Boundaries of the system (what is included and excluded).

### 1.6 Structure of the Report *(Sub-topic)*

> Briefly describe what each chapter covers. Example structure:

- Chapter 1 covers `[...]`
- Chapter 2 covers `[Literature Review]`
- Chapter 3 covers `[...]`
- *(Continue for all chapters)*

---

## Chapter 02 – Background, Objectives and Deliverables

### 2.1 Background

- Who are the current users of the system?
- Context and background of the domain/problem area.

### 2.2 Stakeholders

- Write about all stakeholders involved in or affected by the system.
- Identify both primary and secondary stakeholders.

### 2.3 Objectives

> *(Note: Objectives were written in Chapter 01 — do not repeat in full here. Reference Chapter 01 or provide a brief summary if required by your supervisor.)*

### 2.4 Deliverables

> Output documents and artefacts to be submitted:

**Technical Deliverables:**
- User Case Diagrams
- Final System
- ER Diagram
- High-Level Architecture Diagram
- Source Code

**Documentation Deliverables:**
- Test Cases
- User Manual
- Interim Report
- Project Proposal
- PID (Project Initiation Document)

---

## Chapter 03 – Requirements

### 3.1 Requirements Gathering Techniques

> Describe the techniques used to gather requirements. You must demonstrate evidence of proper gathering.

**Techniques Used:**
- **Observations:** `[Describe what was observed and findings]`
- **Interviews:** `[Describe how interviews were conducted, who was interviewed, and key findings]`
- **Questionnaires:** `[Describe the questionnaire, how a Google Form was created, distributed, and findings]`

> **Evidence (add to Appendix):**
> - How interviews were conducted
> - How questionnaires were conducted
> - How observations were conducted
> - Any existing/exiting documents reviewed
>
> *Screenshots (SS) of all the above should be added to the Appendix.*

> **Summary Statement:** Explain that requirements were gathered in a proper and structured way.

### 3.2 Tools Used

- GitHub
- VS Code
- MongoDB
- `[List all other tools used]`

### 3.3 Functional Requirements

> Functional requirements must be listed in the following **MoSCoW priority order**:

#### Must Requirements *(Mandatory — minimum requirements of the application)*

| ID | Requirement |
|---|---|
| FR-M01 | `[...]` |
| FR-M02 | `[...]` |

#### Should Requirements *(Important — efficiency, user-friendliness)*

| ID | Requirement |
|---|---|
| FR-S01 | `[...]` |
| FR-S02 | `[...]` |

#### Could Requirements *(Nice to have — future enhancements that may be added)*

| ID | Requirement |
|---|---|
| FR-C01 | `[...]` |

> *Note: "Could" requirements represent future enhancements. We will encounter this kind of problem — that is why we add this kind of requirement.*

### 3.4 Non-Functional Requirements

> As an undergraduate, add 3 to 4 achievable non-functional requirements.

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Security | Passwords and access control `[...]` |
| NFR-02 | Usability | System must be easy to use `[...]` |
| NFR-03 | Maintainability | How easily the code can be updated `[...]` |
| NFR-04 | `[Add more if needed]` | `[...]` |

---

## Chapter 04 – Method of Approach

### 4.1 Software Development Methodology

**Main Methodology: Agile**

**Reasons for choosing Agile:**
- This is a long-term project.
- There are no fixed requirements — requirements can change.
- Client requirements can change during development.
- Some requirements are not clear at the start.

**Sprint Management:** GitHub (used to manage sprints)

### 4.2 Sprint Plan

| Sprint | Duration | Goals/Tasks |
|---|---|---|
| Sprint 1 | `[dates]` | `[...]` |
| Sprint 2 | `[dates]` | `[...]` |
| *(Add more)* | | |

### 4.3 Tools & Technologies

> Tell all tools that you used:

| Tool/Technology | Purpose |
|---|---|
| GitHub | Version control & sprint management |
| VS Code | Development environment (IDE) |
| MongoDB | Database |
| `[Add all others]` | `[Purpose]` |

---

## Chapter 05 – Literature Review

### 5.1 Introduction to Literature Review

`[Brief paragraph introducing this chapter]`

### 5.2 Review of Similar Systems

> For each Research Article / Similar System reviewed:
> - Identify the Research Components used.
> - Critically evaluate the system.
> - State the **good features** of that system.
> - State the **missing features** — what that system lacks that your system will provide.

#### 5.2.1 `[Similar System / Article 1 Name]`

- **Overview:** `[...]`
- **Research Components Identified:** `[...]`
- **Good Features:** `[...]`
- **Missing Features / Gaps:** `[...]` *(The missing features we have to address in our system)*

#### 5.2.2 `[Similar System / Article 2 Name]`

- **Overview:** `[...]`
- **Research Components Identified:** `[...]`
- **Good Features:** `[...]`
- **Missing Features / Gaps:** `[...]`

#### 5.2.3 `[Similar System / Article 3 Name]`

*(Continue pattern for each system reviewed)*

### 5.3 Summary

`[Summarise what has been learned from the literature review and how it informs your project]`

---

## Chapter 06 – Design

> **Note:** All diagrams need explanation. Small/simple diagrams still need explanation. ER diagrams and Class diagrams need assumptions stated.

### 6.1 Overall Architecture Diagram

- Present the high-level architecture diagram of the system.
- Provide a detailed explanation of the architecture.

### 6.2 Use Case Diagrams *(Module-wise)*

- Create use case diagrams for each module.
- Explain each diagram.

### 6.3 Class Diagrams *(for MongoDB)*

- Create class diagrams appropriate for the MongoDB data model.
- Explain each diagram and state assumptions.

### 6.4 ER Diagrams

- Create ER diagrams for the data model.
- Explain each diagram and state assumptions.

### 6.5 Sequence Diagrams *(At least 3)*

- Create at least **3 sequence diagrams** for main processes.
- Explain each diagram.

#### Sequence Diagram 1: `[Process Name]`
`[Diagram + Explanation]`

#### Sequence Diagram 2: `[Process Name]`
`[Diagram + Explanation]`

#### Sequence Diagram 3: `[Process Name]`
`[Diagram + Explanation]`

### 6.6 Activity Diagrams

> For the **3 main processes**, create **3 activity diagrams**.

#### Activity Diagram 1: `[Process Name]`
`[Diagram + Explanation]`

#### Activity Diagram 2: `[Process Name]`
`[Diagram + Explanation]`

#### Activity Diagram 3: `[Process Name]`
`[Diagram + Explanation]`

---

## Chapter 07 – Implementation *(Development Chapter)*

### 7.1 Programming Languages Used

| Language | Version |
|---|---|
| `[e.g., JavaScript]` | `[e.g., ES2022]` |
| `[e.g., Python]` | `[e.g., 3.11]` |
| *(Add all languages used)* | |

### 7.2 Development Environment

- IDE: `[e.g., VS Code]`
- Operating System: `[...]`
- Other tools: `[...]`

### 7.3 Main Module Development

> For each main module, explain the development with:
> - Algorithm / logic description
> - Flowchart explaining the algorithm
> - Code snippet (Screenshots/SS of the **algorithm/core code part only**)
> - Follow **coding standards** throughout

#### Module 1: `[Module Name]`

**Algorithm:**
`[Describe the algorithm]`

**Flowchart:**
`[Insert flowchart]`

**Code Snippet (SS — algorithm part only):**
`[Insert screenshot of relevant code]`

#### Module 2: `[Module Name]`

*(Repeat pattern for each main module)*

---

## Chapter 08 – Testing & Evaluation

> **Important:** Use **real testing screenshots (SS)** as evidence. When writing test cases, use an **acceptable format** (e.g., Excel format from Software Tool lecture). Add screenshots to the Appendix.

### 8.1 Unit Testing

| Test Case ID | Module | Input | Expected Output | Actual Output | Pass/Fail |
|---|---|---|---|---|---|
| TC-U01 | `[Module]` | `[...]` | `[...]` | `[...]` | `[Pass/Fail]` |

### 8.2 Integration Testing

| Test Case ID | Modules Integrated | Input | Expected Output | Actual Output | Pass/Fail |
|---|---|---|---|---|---|
| TC-I01 | `[...]` | `[...]` | `[...]` | `[...]` | `[Pass/Fail]` |

### 8.3 System Testing

| Test Case ID | Test Scenario | Input | Expected Output | Actual Output | Pass/Fail |
|---|---|---|---|---|---|
| TC-S01 | `[...]` | `[...]` | `[...]` | `[...]` | `[Pass/Fail]` |

### 8.4 User Acceptance Testing *(UAT)*

> Create Google Forms and send to friends/users to get responses. Add screenshots of the form and responses to the Appendix.

- **Method:** Google Form distributed to `[number]` users.
- **Results Summary:** `[...]`
- *(Add SS of form and responses in Appendix)*

### 8.5 Non-Functional Testing

> Conduct non-functional testing using different apps/tools. Add screenshots (SS) to the Appendix.

| NFR Tested | Tool/Method Used | Result |
|---|---|---|
| Security | `[...]` | `[...]` |
| Performance | `[...]` | `[...]` |
| `[Other NFR]` | `[...]` | `[...]` |

### 8.6 Manual Testing

> **Note:** Manual testing is the main consideration as it is one of your Deliverables. Ensure this is documented thoroughly.

`[Describe manual testing approach and results]`

---

## Chapter 09 – End Project Report

### 9.1 Project Summary

`[Summarise the entire project — what was built, how it was built]`

### 9.2 Your Achievements

`[List and describe what you personally achieved during this project]`

> **Self Evaluation:** Reflect on whether you achieved the objectives set in Chapter 01 and whether you achieved the project scope.
> - Did you achieve the objectives? `[Yes/No — explain]`
> - Did you achieve the scope? `[Yes/No — explain]`

### 9.3 Customer Feedback

`[Include feedback received from the client/customer/users about the system]`

### 9.4 User Benefits

`[Describe the benefits that end users gain from using the system]`

---

## Chapter 10 – Project Post-Mortem *(Reflections)*

### 10.1 What Good Things Have You Learned From This Project?

`[Reflect on positive learning experiences and outcomes]`

### 10.2 Soft Skills Developed Personally

`[Describe the soft skills (e.g., communication, time management, teamwork) you developed during the project]`

### 10.3 Technical Skills Developed Personally

`[Describe the technical skills you developed personally during the project]`

### 10.4 What New Technologies Have You Learned?

`[List and describe any new technologies you learned during the project]`

### 10.5 Limitations of Technologies Used

`[For each technology used, describe the limitations that came with using it]`

| Technology | Limitation(s) |
|---|---|
| `[Technology 1]` | `[...]` |
| `[Technology 2]` | `[...]` |
| *(Add all)* | |

---

## Chapter 11 – Conclusion

> **Order of content in this chapter:**
> 1. What have you done (summary)
> 2. Main limitations
> 3. Future suggestions

### 11.1 Final Project Summary *(What Have You Done)*

`[A concise final summary of the entire project — what was done, how it was done, and what was achieved]`

### 11.2 Main Limitations

`[Describe the main limitations of the current system or project. At least 2 limitations.]`

1. `[Limitation 1]`
2. `[Limitation 2]`
3. `[Add more if applicable]`

### 11.3 Future Suggestions

`[Describe what could be improved or added in the future. At least 3 suggestions.]`

1. `[Future suggestion 1]`
2. `[Future suggestion 2]`
3. `[Future suggestion 3]`
4. `[Add more if applicable]`

---

## List of References

> Use the referencing style required by your university (typically IEEE or Harvard). Ensure all in-text citations are consistent with this list.

`[Add all references here in alphabetical/numerical order]`

---

## Appendices

### Appendix A – Interview Questions & Evidence

- Interview questions used
- Evidence of how interviews were conducted (SS)

### Appendix B – Questionnaire Questions & Evidence

- Questionnaire questions
- Google Form screenshots
- Questionnaire responses / SS

### Appendix C – Observation Evidence

- How observations were conducted
- Observation notes / SS

### Appendix D – Exiting / Existing Documents Reviewed

`[Any existing documents that were reviewed as part of requirements gathering]`

### Appendix E – User Guide

`[Step-by-step guide for end users on how to use the system]`

### Appendix F – PID *(Project Initiation Document)*

`[Attach the PID here]`

### Appendix G – Interim Report

`[Attach the Interim Report here]`

### Appendix H – Supervisor Signature Forms

`[Attach all supervisor signature / meeting approval forms]`

### Appendix I – Meeting Minutes

`[All meeting minutes with supervisor]`

### Appendix J – Test Case Screenshots (SS)

`[Screenshots of real test executions — unit, integration, system, UAT, non-functional]`

> *Add further appendices (K, L, etc.) as needed.*

---

*End of Report Structure — PUSL 3190 Computing Project Final Report*
