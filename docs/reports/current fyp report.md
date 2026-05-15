




PUSL3190 Computing Project
Final Report



<Project Title Here>


Supervisor: <Supervisor Name Here>

Name: <Your Name Here According to PU ID>
Plymouth Index Number: <Your PU ID Here>
Degree Program: <Your Degree Program Here>  






Acknowledgements
The successful completion of this project would not have been possible without the guidance, support, and encouragement of several individuals, to whom sincere gratitude is expressed.
Foremost, heartfelt appreciation is extended to Ms. Yasanthika Mathotaarachchi, project supervisor, for the invaluable academic guidance, constructive feedback, and unwavering support provided throughout the entire duration of this project. Her expertise and encouragement played a decisive role in shaping the quality and direction of this work.
Gratitude is also extended to all academic staff members at NSBM Green University and the University of Plymouth for their dedication to delivering high-quality education and for their continued support throughout the degree programme.
Finally, sincere thanks are offered to family and friends whose encouragement, patience, and moral support sustained this journey from inception to completion.

Abstract
The contemporary financial landscape is characterised by rapid transition toward digital ecosystems, where cashless transactions and subscription-based services have significantly reshaped consumer behaviour. While these developments have improved transactional convenience, they have simultaneously introduced challenges in financial self-regulation and expenditure awareness. Individuals now manage multiple income streams and recurring expenses across diverse digital platforms, resulting in fragmented financial visibility and reduced control over personal cash flow (IMF, 2024). The Smart Financial Tracker (SFT) platform was developed as a comprehensive web-based personal finance management solution to address these structural and behavioural inefficiencies. Developed using the MERN technology stack — MongoDB, Express.js, React, and Node.js — the system delivers a unified and behaviourally informed environment for financial tracking and budgeting. Unlike conventional banking applications that primarily provide retrospective transaction summaries, the SFT platform emphasises active financial engagement through structured manual recording, intelligent budget alerts at 80%, 90%, and 100% utilisation thresholds, milestone-based savings goal tracking, peer-to-peer wallet transfers with ACID-compliant atomicity, and real-time interactive data visualisation. The project followed an Agile Scrum methodology across ten structured two-week sprints, enabling iterative refinement and continuous alignment with evolving user requirements. Rigorous testing strategies — including unit, integration, system, and user acceptance testing — were employed to validate system robustness and functional correctness. The final outcome is a comprehensive financial intelligence platform that empowers users to transition from reactive financial logging to proactive financial planning, thereby improving financial awareness, decision-making quality, and long-term financial stability.






Chapter 01 – Introduction
1.1 Project Background
Personal financial management has become an essential competency for long-term stability, particularly within the modern, rapidly evolving digital economy. Individuals today are increasingly responsible for orchestrating multiple income sources, ad-hoc digital purchases, variable recurring expenses, and short-term financial commitments across a wide array of platforms. The widespread adoption of online payment gateways, cashless transactions, and subscription-based services has brought unprecedented speed and convenience to consumers. However, this profound shift has simultaneously created an "invisible economy," where the physical and psychological friction associated with spending tangible cash has been largely removed (Federal Reserve, 2024). 

This phenomenon, often referred to as payment decoupling, frequently masks the true cumulative costs of daily lifestyle choices. Because money is spent invisibly and frictionlessly, consumers often lose cognitive awareness of their expenditure patterns (Deloitte, 2023). Without a centralized, visible structure to monitor these diverse digital cash flows, individuals resort to making reactive financial decisions driven by immediate gratification rather than objective income assessment (Kahneman, 2011; Byrne and Brooks, 2008). Consequently, fragmented financial visibility severely inhibits effective self-regulation, resulting in poor budgeting, accumulated liabilities, and growing financial stress (World Bank, 2024). There is, therefore, a pressing urgency for digital tools that not only track expenditure but actively restore visibility and mindful engagement to personal finance.

1.2 Problem Statement
Contemporary personal finance management systems suffer from structural weaknesses that inhibit proactive financial regulation and holistic visibility. The continued reliance on traditional manual tracking approaches, such as physical notebooks or custom spreadsheet templates proves to be highly inefficient, prone to human and formula errors, and difficult to maintain over long periods, ultimately lacking any predictive insight (Pressman, 2020). 
Conversely, modern commercial financial applications often oversaturate users with complex, feature-heavy interfaces that prioritize automated bank synchronization over user engagement. This excessive reliance on automation removes the user's active awareness of their spending behaviours, contributing to further financial dissociation. Furthermore, existing tools are primarily reactive rather than proactive; they typically alert users only after a budget has already been exceeded, offering no opportunity for mid-cycle behavioural correction (Alea IT Solutions, 2025). Additionally, standard single-user tracking systems usually fail to integrate shared expenses or peer-to-peer (P2P) functionality, forcing users into a disjointed experience managed across multiple apps. Ultimately, individuals lack a cohesive, predictive, and behaviourally engaging platform that allows them to securely monitor their financial health and anticipate financial strain before it occurs.

1.3 Motivation
The motivation for this project is driven by the significant societal implications associated with financial mismanagement, notably escalating consumer debt, inadequate emergency savings, and widespread financial anxiety among emerging adults and professionals. A careful analysis of the existing financial technology ecosystem revealed a stark functional dichotomy: available tools are either overly simplistic and static, or unnecessarily complex and highly automated. The heavily automated applications strip away user accountability and learning, whereas the granular manual tools lack the analytical depth required to forecast future financial states.
The primary purpose of undertaking this project was to bridge this precise gap by engineering a platform that actively empowers the user. By deliberately encouraging structured, mindful manual data entry to build healthy financial habits (Thaler and Sunstein, 2008), while simultaneously providing enterprise-grade backend analytics to process that data, the project aims to shift user behaviour. The ultimate motivation is to transition users from a state of passive, reactive financial logging to an active state of proactive, informed, and confident financial planning constraint (Xiao and O’Neill, 2018).

1.4 Aim of the Project
The aim of this project is to architect, develop, and deploy a secure, scalable, and user-centric web-based personal finance management system that leverages real-time data visualization, statistical predictive analytics, and artificial intelligence to empower users to proactively track, categorize, and optimize their finances, with the help of the MERN framework (MongoDB, Express.js, React.js, Node.js), Python microservices, and Machine Learning technologies (Suryavanshi, 2024).

1.5 Objectives
The objectives of the project were established following the SMART (Specific, Measurable, Achievable, Relevant, Time-bound) framework to carefully guide the development lifecycle:
•	To design and deploy a comprehensive web application within the first three months of development that allows users to perform full Create, Read, Update, and Delete (CRUD) operations on income and expense records across customizable categories, thereby ensuring robust data integrity and user accountability.
•	To implement an intelligent budgeting mechanism by the mid-project milestone that issues progressive visual and system-level threshold alerts at 80%, 90%, and 100% utilization, actively encouraging behavioural spending adjustments before budget limits are breached.
•	To complete and integrate a secure internal digital wallet system within an eight-week sprint, enabling seamless peer-to-peer (P2P) transfers backed by transactional atomicity, double-entry accounting principles, and reliable audit trails (Taduka, 2024).
•	To deploy an advanced predictive analytics and reporting layer by the start of the final project quarter, utilizing statistical linear regression for short-term expense forecasting (Montgomery, Peck and Vining, 2012), alongside machine learning algorithms (such as Random Forest Regressors) to generate long-term retirement projections.
•	To establish direct, automated bank integration globally for instantaneous transaction synchronization. 
Reasons for non-achievement: Sourcing direct, frictionless integration was hindered by profound technical barriers regarding high-tier, costly external API dependencies and stringent regional open-banking data privacy restrictions. Furthermore, given the strict academic timeframe, building robust compliance architectures was unachievable. Ultimately, scoping out direct bank automation directly reinforced the core, validated behavioural objective of the project: maintaining the user’s cognitive engagement through mandatory, structured manual data entry.

1.6 Scope
The functional scope of the Smart Financial Tracker covers a robust suite of capabilities that have been fully developed and successfully integrated into the platform to facilitate holistic financial hygiene. The finished functions include:

•	Transaction Management: A reliable, structured manual framework for recording income and expenses, supported by a deep customization engine that allows users to dynamically organize records into personalized categories and subcategories.
•	Budgeting & Savings Goals: The granular setup of flexible weekly and monthly budgets equipped with progressive utilization monitoring, as well as an interactive, milestone-based savings goal tracker to incentivize consistency (Academy Bank, 2024).
•	Real-Time Analytics Dashboard: Dynamic, highly responsive visual dashboards (developed via React) that present categorized spending breakdowns, cash flow trends, and instantaneous financial summaries.
•	Intelligent Forecasting & AI Assistant: The integration of statistical linear regression to intelligently forecast short-term financial trends, machine learning modules for retirement planning insights, and a Large Language Model (LLM)-powered interactive chatbot (Draggable Assistant) providing contextual financial awareness guidance.
•	Secure Internal Wallet: A functional digital wallet designed for in-network Peer-to-Peer (P2P) transfers with robust ledger tracking to assist users in resolving shared financial commitments interactively.
•	Authentication & Access Control: A comprehensive, stateless security architecture utilizing JSON Web Tokens (JWT) and multi-tiered Role-Based Access Control distinguishing securely between Super Admins, standard Users, and Guests (OWASP, 2023).

1.7 Structure of the Report
The remainder of this report is organized systematically to document the theoretical principles, technical methodologies, design, implementation, and overall evaluation of the project:
Chapter 02 – Background, Objectives, and Requirements: This chapter establishes the foundation for the software artifact. It houses the ‘Literature Review’, comparing similar commercial systems (e.g., Mint, YNAB, PocketGuard) to pinpoint behavioural and market gaps (Huxley, 2022). It delineates the ‘Method and Approach’, detailing the Agile software development methodology and MERN-based ‘Architecture’ adopted to drive the project. Finally, it outlines the explicit functional and non-functional ‘Requirements’ gathered through surveys, stakeholder interviews, and other rigorous requirement-finding techniques.
Chapter 03 – System Design: This chapter presents the strategic blueprint of the application, encompassing architectural wireframes, use case diagrams, entity-relationship diagrams, UI/UX conceptual mockups, and the robust NoSQL database schemas engineered to satisfy the system requirements.
Chapter 04 – Implementation: This chapter dissects the technical realization of the project. It describes the programming logic, the modular integration of core features (transaction mapping, predictive analytics, intelligent AI assistant, and P2P wallet processes), and the configuration methodologies.
Chapter 05 – System Testing and Evaluation: This chapter details the comprehensive quality assurance strategies executed to validate system stability and security. It outlines automated backend unit and integration testing via Jest, frontend component validation via Vitest, and end-to-end user workflow confirmation utilizing Playwright.
Chapter 06 – Project Post-Mortem: This chapter offers a critically reflective analysis of the complete project lifecycle. It examines methodological successes, evaluates technical barriers and time constraints encountered, discusses exactly how obstacles were mitigated, and emphasizes key personal and professional development outcomes.
Chapter 07 – Conclusions and Future Work: The final chapter synthesizes the outcomes of the Smart Financial Tracker software against the established background aims and objectives. It concludes with an assessment of the system's impact on behavioural financial awareness and proposes viable technological avenues for future feature enhancements.

Chapter 02 – Background and Deliverables
2.1 Background and Domain Context
While the fundamental problem of financial tracking was introduced previously, a deeper examination of the demographic landscape, current user behaviours, and the existing personal finance ecosystem is required to contextualize the necessity of the Smart Financial Tracker (SFT).

The Target Demographic and the Literacy-Behavioural Gap
The primary users of personal financial systems are increasingly younger demographics, specifically emerging adults, university students, and early-career professionals. These individuals find themselves navigating an unprecedented affordability crisis (CSAC, 2025). Recent demographic analyses reveal a stark reality: a significant majority of university undergraduates would struggle to secure emergency funds for unexpected expenses (Santander UK, 2025), and many routinely exhaust their working capital before the end of the financial cycle (NCAN, 2024). Such financial vulnerability severely impacts cognitive bandwidth, academic focus, and overall mental health.

Within this demographic, a profound "literacy-behavioural gap" exists. Research indicates that while an overwhelming majority of emerging adults express confidence in their money management capabilities, very few actually apply structured financial practices (OECD, 2024). A fraction of this population actively utilizes dedicated budgeting applications, and an even smaller percentage maintains a structured emergency fund. This disparity suggests that theoretical overconfidence often masks a critical lack of practical, sustained financial experience. Furthermore, modern digital platforms and social media have increasingly become the primary sources of financial education for young adults. These platforms frequently offer fragmented, trend-driven advice prioritizing high-risk investments, fundamentally neglecting core concepts like cash flow management, automated savings, and daily expenditure observation.

Current Tracking Practices and Behavioural Friction
To manage their finances, the current consumer base typically relies on three fragmented methodologies, each presenting significant usability barriers:

1.	Paper-Based Tracking: A notable percentage of users still record transactions manually in physical ledgers. While this encourages psychological ownership, it carries a high risk of data loss, offers zero real-time analytical insight, lacks visual pattern recognition, and is highly location dependent.
2.	Spreadsheet-Based Systems: Many digitally literate users construct custom spreadsheets utilizing mathematical formulas. However, these systems inherently cascade formula errors, require tedious manual categorization that drains user energy over time, and suffer from poor mobile usability, which ultimately discourages point-of-sale data logging.
3.	Fragmented Commercial Ecosystems: Users who have migrated to digital solutions frequently find themselves utilizing entirely separate applications for budgeting, peer-to-peer (P2P) transfers, and savings tracking. This ecosystem fragmentation requires a significant weekly time investment to manually reconcile data across different interfaces. Furthermore, users across these platforms consistently report an inability to accurately estimate recurring subscription costs—often resulting in large miscalculations of their fixed negative cash flow—because commercial apps bury these metrics within general spending categories.

These prevailing practices illustrate a landscape characterized by user exhaustion, reactive financial monitoring, and severe application fatigue. The background context ultimately highlights a critical demand for a unified, accessible platform tailored to users who need to build fundamental financial persistence without being overwhelmed by enterprise-level banking mechanics.

2.2 Project Stakeholders
The successful development, deployment, and evaluation of the Smart Financial Tracker involve multiple interconnected individuals and entities. Recognizing the roles, expectations, and influences of these stakeholders is critical to ensuring the final system delivers appropriate value and aligns with established academic and functional standards.
End Users (University Students and Early-Career Professionals): End users are the primary beneficiaries of the platform and the focal point of the system’s design architecture. Their operational requirements dictate the necessity for an intuitive, low-friction user interface, an accessible digital wallet, and robust data privacy via secure authentication. As a demographic susceptible to financial anxiety, their primary interest lies in acquiring clear, actionable financial visibility and accurate forecasting that actively reduces the cognitive overload associated with money management.
Project Developer (Software Engineer): Serving as the sole architect and implementer of the system, the developer is responsible for the end-to-end software development lifecycle. This involves translating complex behavioural concepts and user requirements into functional code using the MERN stack, integrating Machine Learning models, establishing CI/CD pipelines, and strictly adhering to modern software engineering best practices within the allocated schedule.
Project Supervisor: The project supervisor operates as the strategic and technical mentor throughout the development cycle. They provide essential academic guidance, ensuring the complexity and implementation of the project reflect the rigorous standards required for a final-year capstone project. They continuously evaluate milestones, offer critical feedback on methodological approaches, and ensure technical blockages are systematically navigated.
Academic Institution (NSBM / Plymouth University): The associated academic institutions serve as the overarching regulatory and standardization bodies. Their primary interest ensures that the project rigorously adheres to defined curriculum parameters, ethical guidelines, and assessment regulations, evaluating how successfully the project demonstrates the student's mastery of computer science principles.
Future Developers and Open-Source Contributors:  As a scalable, well-documented full-stack application, the SFT platform is designed with future maintainability in mind. Subsequent developers represent a vital stakeholder group, requiring clean, modular code architectures, extensive technical documentation, and transparent test coverage to effectively adapt, debug, or extend the system's capabilities in the future.

2.3 Project Deliverables
Throughout the software development lifecycle, a structured series of tangible artifacts and technical components were systematically produced. These deliverables act as verifiable milestones, documenting the evolution of the Smart Financial Tracker from theoretical conceptualization to a fully functional, production-ready system. 

2.3.1 Academic and Project Management Deliverables
Project Proposal: The foundational document that defined the initial problem statement, established project feasibility, scoped the business case, and justified the selection of the MERN stack against existing market alternatives (Enfin Technologies, no date).
Project Initiation Document (PID): A comprehensive planning artifact detailing the specific parameters of the project, including time-bound scheduling, resource allocation, initial technical constraints, and predefined functional limitations to safely guide continuous development.
Interim Report: A mid-project academic evaluation highlighting the progress of requirements gathering, detailing the extensive literature review of competing financial tools, and solidifying the initial architectural approach leading into the core development phase.
Final Project Report: This definitive academic document synthesizing the complete project lifecycle. It encompasses the finalized system architectures, implementation methodologies, rigorous end-project testing analysis, and a critical post-mortem examining the development methodology.

2.3.2 System Design Artifacts
Use Case Diagrams: Graphical representations defining the structural boundaries of the system and outlining all authorized interactions between varying user roles (Admin, User, Guest) and core functionalities (e.g., transaction logging, smart budgeting, P2P transfers).
Entity-Relationship (ER) Diagrams: Detailed data modeling schematics that visually map the MongoDB document architectures, defining how user accounts computationally link to localized transactions, custom categories, wallet balances, and notification structures.
High-Level Architectural Diagrams: Comprehensive blueprints detailing the full-stack topology, mapping the interaction flows between the client-side React frontend, the Node.js/Express backend API gateway, external Machine Learning regression services, and cloud hosting infrastructure.

2.3.3 Software and Engineering Artifacts
The Final Software System: The successfully developed, tested, and fully deployed Smart Financial Tracker application. This deliverable serves as the interactive culmination of all integrated technologies, featuring real-time interactive dashboards, predictive AI assistants, functioning P2P wallet logic, and secure authentication routing.
Project Source Code: The complete, version-controlled codebase comprising the entire monolithic architecture. Hosted on a secure GitHub repository, it contains heavily commented scripts, configuration files, environment variables, continuous integration (CI) automations, and algorithmic regression models.

2.3.4 Quality Assurance and Operational Documentation
Test Cases and Evaluation Results: A rigorous compilation of automated quality assurance scripts and diagnostic results. This deliverable includes detailed reports from backend unit and integration tests (Jest), dynamic frontend component evaluations (Vitest), and robust end-to-end browser workflow validations (Playwright), ensuring system stability across all core features.
User Manual and System Guide: A comprehensive technical operational guide outlining the required hardware/software platform specifications. It provides granular, step-by-step instructions documenting how end-users can safely register accounts, securely utilize digital wallets, generate financial projections, and safely troubleshoot the deployed environment.

Chapter 03 – Literature Review
3.1 Introduction to Personal Financial Management Systems
Personal Financial Management (PFM) systems are widely recognized as essential digital tools intended to assist individuals in monitoring income, regulating routine expenses, and cultivating long-term savings goals. Academic research in behavioural finance consistently demonstrates that structured financial tracking contributes positively to budgeting discipline by encouraging continuous engagement with personal financial metrics (Thaler and Sunstein, 2008). 

However, recent shifts in financial technologies have seen an industry-wide pivot toward total automation, primarily through direct bank API integrations and automated transaction categorization. While this automation significantly reduces the burden of manual data entry, it simultaneously removes the psychological friction of spending. By detaching the user from the active logging of their expenditure, modern systems inadvertently promote a passive "invisible economy." This digital convenience frequently results in reduced cognitive engagement, where users merely review retrospective summaries rather than actively regulating their daily consumption. Consequently, a core challenge in the current PFM landscape is balancing the efficiency of automated software with the behavioural necessity of active user engagement.

3.2 Critical Evaluation of Existing Commercial Systems
To establish a baseline for the Smart Financial Tracker (SFT), a comprehensive competitive benchmarking analysis of leading commercial applications was conducted. Evaluating these systems highlights critical functional paradigms while also exposing significant methodological and feature-based limitations that the SFT aims to resolve.


3.2.1 YNAB (You Need A Budget)
Strengths: YNAB is widely considered the industry standard for methodical financial planning (NerdWallet, 2026). It successfully employs a "zero-based budgeting" methodology, which mandates that every single dollar is explicitly assigned a categorical "job" prior to being spent. This encourages strict financial discipline and prevents arbitrary spending.
Missing Features & Weaknesses: The primary limitation of YNAB is its exceptionally steep learning curve, which frequently proves exclusionary for beginners or younger users lacking specialized financial literacy. Furthermore, it operates on an expensive subscription model (approx. $109/annually), fundamentally alienating the university student demographic who require assistance the most. Lastly, it lacks integrated forecasting mechanics and peer-to-peer (P2P) functionalities.
The SFT Solution: The SFT replaces rigid zero-based paradigms with an intuitive, flexible, milestone-based budgeting interface that allows for adaptive categorization. Furthermore, it completely removes the enterprise cost barrier (Reddit, no date), providing a highly accessible, free-to-use platform tailored for students and early-career professionals.

3.2.2 Mint / Credit Karma
Strengths: Mint (now integrated into Credit Karma) revolutionized the market by providing entirely free, highly automated expense tracking (Experian, 2026). Its core strength lies in its ability to securely synchronize with hundreds of external bank accounts, automatically categorizing card transactions into visual reports without requiring any user input.
Missing Features & Weaknesses: The over-reliance on bank API synchronization introduces sever data latency; transactions often take days to clear and appear, rendering real-time, point-of-sale decision-making impossible (Sentry, 2024). More critically, the total automation severely diminishes the user’s cognitive awareness of their spending flows. Since its acquisition, the platform has also aggressively shifted away from dedicated budgeting functionality toward reactive credit-monitoring and targeted financial product advertising (MyBankTracker, 2024).
The SFT Solution: To counter the dissociation caused by automated data syncing, the SFT deliberately utilizes a manual-first transaction logging architecture. Research shows that the physical act of inputting expenses fortifies behavioural accountability. The SFT ensures that data is processed in true real-time, completely avoiding external API dependency bottlenecks and preserving user privacy by eliminating third-party data commercialization.

3.2.3 PocketGuard
Strengths: PocketGuard excels in usability and simplification. It utilizes a "snapshot" algorithm to calculate exactly how much disposable income a user has remaining "in their pocket" after accounting for upcoming bills, recurring subscriptions, and baseline savings goals. 
Missing Features & Weaknesses: While excellent for rapid daily checks, PocketGuard’s analysis is heavily static. It provides only a surface-level assessment and lacks the deep, personalized analytical reports necessary to drive meaningful, long-term behavioural change. Furthermore, like most individual-focused PFM tools, it completely ignores shared financial responsibilities, forcing users to utilize separate applications (e.g., Splitwise, Venmo) to manage and track shared expenses.
The SFT Solution: The SFT bridges the static analysis gap by introducing an advanced Predictive Analytics layer utilizing algorithmic linear regression and Machine learning. Instead of just showing what money is left today, the SFT actively forecasts future expenditure trends. Additionally, the SFT completely eliminates ecosystem fragmentation by integrating a secure internal digital wallet, allowing users to trace, manage, and reconcile shared peer-to-peer (P2P) expenses within a single, unified environment.

3.3 Identified Research and Technological Gaps
The critical evaluation of these commercial leaders reveals three interconnected gaps that constrain the effectiveness of the modern personal finance ecosystem:

1.	The Behavioural Support Gap (Reactive vs. Proactive): Most commercial systems exist strictly as reactive databases. They function perfectly to notify users *after* a budget limit has already been exceeded. They offer limited behavioural nudging to prevent the financial error from occurring. 

SFT Intervention: The SFT implements a proactive, intelligent budgeting mechanism that issues progressive, real-time alerts when a user hits 80%, 90%, and 100% of a category's capacity, providing a critical window for behavioural correction.

2.	The Analytical and Predictive Gap: Existing free or consumer-grade applications rely entirely on historical data visualization. They tell the user what happened last month but provide no mathematical insight into where the user's finances are trending next month. 

SFT Intervention: The integration of Large Language Models (LLM) for contextual guidance and statistical forecasting models (e.g., Random Forest regressors for retirement planning) elevates the system from a passive ledger to a forward-looking financial advisor.

3.	The Ecosystem Fragmentation Gap: Managing modern finances involves shared utility bills, splitting dining costs, and collective rent. Traditional PFM tools completely ignore this, focusing only on siloed individual wealth.

SFT Intervention: Introducing localized P2P wallet tracking allows the system to act as a comprehensive ledger, recognizing that modern personal finance is frequently collaborative.

3.4 Synthesis of the Literature
In conclusion, the literature and competitive market analysis highlight a distinct dichotomy: modern financial tools are either highly automated and behaviourally passive (like Credit Karma) or intensely complex and cost-prohibitive (like YNAB). The research definitively points to an underexplored middle ground—a system that marries the cognitive benefits of manual, mindful engagement with the heavy analytical firepower of modern web frameworks and predictive AI. The Smart Financial Tracker is engineered specifically to occupy this exact paradigm.






Chapter 04 – Method of Approach
4.1 Introduction to the Development Methodology
The successful execution of complex software engineering projects requires a structured yet adaptable framework to manage the Software Development Life Cycle (SDLC). For the development of the Smart Financial Tracker (SFT), the Agile methodology was selected as the primary overarching framework (Sommerville, 2021). Unlike traditional sequential models (such as Waterfall), Agile promotes continuous iteration, integration, and testing throughout the project lifecycle. This approach allowed the development process to be broken down into manageable, functional increments known as sprints, ensuring that core features were delivered, evaluated, and refined continuously rather than attempting massive monolithic deployments at the end of the project timeline.

4.2 Justification for Agile Methodology
The decision to utilize Agile was driven by several critical operational constraints and technical characteristics unique to this project:
•	Long-Term Project Horizon: As a major academic capstone project spanning several months, Agile provided the necessary pacing to sustain momentum, preventing development bottlenecks and ensuring steady milestone achievements.
•	Evolving and Unfixed Requirements: At the project's inception, while high-level objectives were defined, the granular technical requirements especially concerning the implementation of Machine Learning regression models and the AI chatbot were not completely clear. Agile allowed the architecture to naturally evolve as technical feasibility was continuously assessed.
•	Adaptability to Requirement Changes: Working continuously with a project supervisor (acting as the proxy client) yielded ongoing heuristic feedback. Agile facilitated immediate pivoting when required. For instance, when external bank API integrations proved technically and legally unfeasible within the timeframe, Agile's flexibility allowed the project to cleanly pivot back to a "manual-first" data entry paradigm without derailing the entire SDLC.
•	Simultaneous Full-Stack Development: Combining Agile with the monolithic MERN stack allowed for the simultaneous development and integration of both frontend UI components and backend API logic within the exact same sprint cycle, maximizing development efficiency.

4.3 Sprint Management and Version Control
To practically execute the Agile methodology, “GitHub” was utilized extensively not merely as a code repository, but as the central project management hub. 
•	Sprint Execution: The project was divided into logical two-to-three-week sprints. GitHub Projects and Kanban-style issue boards were employed to outline tasks, assign development tickets, and track the flow of features from the "To-Do" backlog, through "In-Progress" development, into code review, and finally to "Completed."
•	Version Control and Collaboration: Git and GitHub managed source code versioning, ensuring that experimental features (such as the interactive Draggable Assistant) could be developed safely in isolated branches before being merged into the primary production `main` branch. This prevented breaking changes and guaranteed a stable baseline application at all times.
•	Continuous Integration: CI/CD pipelines (via GitHub Actions) were established to automatically trigger test suites and build processes every time new code was committed, seamlessly aligning with Agile’s core tenet of continuous integration.

4.4 Technological Stack and Development Tools
In alignment with the Agile approach, a carefully curated suite of modern development tools and frameworks was utilized to build the SFT platform.

4.4.1 Primary Development Environment
•	Visual Studio Code (VS Code): Used as the primary Integrated Development Environment (IDE) due to its lightweight nature, extensive extension marketplace, and built-in terminal support.

4.4.2 The Core MERN Stack
•	MongoDB: Selected as the primary database. Its NoSQL, document-oriented structure provided the schema flexibility required for managing user-defined, highly customizable expense categories (Suryavanshi, 2024).
•	Express.js & Node.js: Utilized to construct the backend business logic and secure API gateway. Node.js’s asynchronous, non-blocking I/O model efficiently handled simultaneous database queries, ensuring rapid, real-time application performance (SourceForge, no date).
•	React.js: Employed to build the dynamic, single-page application (SPA) frontend. React's component-based architecture facilitated the creation of interactive data visualization dashboards.

4.4.3 Artificial Intelligence and Machine Learning Tools
•	Python: Utilized to write specialized backend microservices addressing complex mathematical forecasting.
•	Scikit-Learn: Used to implement the Linear Regression algorithms for short-term expense forecasting and Random Forest Regressors for the retirement planning module.
•	Groq API (LLM Integration): Hosted Large Language Models were integrated to power the contextual "Draggable Assistant," providing dynamic financial awareness guidance.

4.4.4 Quality Assurance and Testing Frameworks
•	Jest: Executed backend unit and integration testing.
•	Vitest: Handled rapid, modular frontend component validation.
•	Playwright: Executed full end-to-end (E2E) browser workflow testing, simulating real user navigation.

4.4.5 APIs and Integrated Core Libraries
To build out the specific functionalities of the Smart Financial Tracker, several internal methodologies and external APIs were utilized:
•	RESTful API Architecture: The internal communication between the React frontend and the Node.js backend was developed entirely using standard REST (Representational State Transfer) API principles. Endpoints were structured logically (using GET, POST, PUT, DELETE methods) to handle the Create, Read, Update, and Delete operations for user transactions and wallet data.
•	Groq API (External LLM API): This external API was integrated to connect the SFT client interface to advanced Large Language Models. It processes the user's natural language queries through the "Draggable Assistant" widget and streams back contextual financial guidance.
•	JSON Web Tokens (JWT) API: Utilized within the security architecture to generate, issue, and verify stateless authentication tokens. This ensures that secure API endpoints (such as retrieving ledger data or executing P2P transfers) can only be accessed by verified, logged-in users.
•	Bcrypt Library: Integrated into the backend user-creation API to securely hash and salt user passwords before storing them in the MongoDB database, ensuring compliance with modern security encryption standards (OWASP, 2023).
•	Mongoose API / ODM: Used as the Object Data Modeling library bridging Node.js and MongoDB. The Mongoose API was responsible for enforcing strict database schema validation (ensuring a transaction always has a 'date', 'amount', and 'category' before saving).
•	Axios / Fetch API: Utilized on the React frontend to asynchronously transmit HTTP requests to the backend server and Python microservices without requiring the web page to reload, enabling a seamless, dynamic user experience.

4.5 Requirements Gathering Techniques
To ensure the proposed system accurately addressed real-world behavioral gaps rather than operating on technical assumptions, a rigorous, mixed-methods requirement gathering phase was conducted. Information was collected systematically from target audiences and existing market tools.
4.5.1 Semi-Structured Interviews
The primary conduit for qualitative requirement gathering involved conducting semi-structured interviews with 26 distinct stakeholders, comprising 15 university students (aged 19–24), 8 early-career professionals, and 3 financial educators. These interview sessions explored five thematic domains: current tracking practices, pain points with existing systems, desired application features, behavioural spending patterns, and technological privacy concerns. This direct engagement ensured the platform's features (such as avoiding forced bank integrations in favour of manual entry to protect privacy) directly reflected the users' spoken boundaries.

4.5.2 Questionnaires and Surveys
To collect broad quantitative data regarding financial literacy, structured questionnaires were deployed. The surveys effectively exposed the "literacy-behavioural gap," revealing that while a vast majority expressed confidence in money management, very few actually maintained a formal budget. The statistical feedback natively informed the necessity for intuitive, progressive visual alerts (at 80%, 90%, and 100% budget utilization) rather than relying on advanced, complex financial jargon.

4.5.3 Observation and Competitive Benchmarking
Observational methodologies were employed by critically analysing and interacting with leading commercial applications under real-world conditions (specifically Mint, YNAB, and PocketGuard). By directly observing the friction points, interface bloat, and paywalls within these existing systems, specific system shortcomings were mapped. This competitive benchmarking provided the empirical justification to focus on a hybrid feature set: maintaining the manual, accountable data entry of physical spreadsheets while incorporating the enterprise-level forecasting visualization normally locked behind premium commercial paywalls. 

4.5.4 Literature and Document Review
Finally, a comprehensive review of current behavioural finance literature was undertaken. Analysing secondary documents and academic papers validated the core premise that active cognitive involvement—established via manual transaction logging produces stronger accountability and sustainable spending discipline compared to total automation. These findings acted as the theoretical constraints that locked in the functional requirements of the SFT platform.

Chapter 05 – Requirements
5.1 Functional Requirements
Functional requirements define the core behaviour, features, and operational capabilities that the Smart Financial Tracker (SFT) must possess to resolve the problems identified in the existing landscape. To effectively prioritize development during the Agile sprints, these requirements were categorized using a prioritization framework based on their criticality to the system's core purpose.

5.1.1 Must Requirements (Mandatory)
These are the foundational, non-negotiable requirements necessary for the SFT to operate as a viable baseline financial tracking system. Without these, the project would fail its primary objective.
•	User Authentication & Security: The system must allow users to register an account, log in securely using encrypted credentials, and manage an authenticated session to protect isolated personal financial data.
•	Manual Transaction Management (CRUD): The system must provide complete Create, Read, Update, and Delete functionality, allowing users to manually construct robust ledgers of daily income and discretionary expense transactions.
•	Dynamic Categorization: The system must allow users to assign each transaction to a specific category (e.g., Groceries, Rent, Subscriptions) and create custom categories to accurately map their unique lifestyle.
•	Budget Threshold Monitoring: The system must permit the creation of defined weekly and monthly fiscal budgets, continuously calculating the remaining balance based on logged expenses mapped to those budget categories.

5.1.2 Should Requirements (Efficiency & User-Friendliness)
These requirements elevate the system from a basic data registry into a highly usable, efficient, and engaging platform. They ensure the system is competitive and actively helpful.
•	Interactive Real-Time Dashboards: The system should instantly process ledger data into dynamic visual charts and graphs (e.g., pie charts for category breakdowns, line graphs for monthly trends) to enhance cognitive pattern recognition.
•	Progressive Budget Alerts: The system should issue visual UI notifications when a user reaches 80%, 90%, and 100% of a defined budget, providing an active window for behavioural correction.
•	Digital P2P Wallet: The system should feature an internal wallet mechanism allowing users to log peer-to-peer transfers with other users in the system to intuitively manage shared expenses (e.g., splitting a utility bill).
•	Contextual AI Assistant: The system should feature an interactive, draggable AI chatbot on the client interface capable of processing user queries to provide general financial awareness and system navigational guidance.

5.1.3 Could Requirements (Future Enhancements & Edge Cases)
These are advanced, value-adding features implemented to provide enterprise-grade capabilities, ensuring the project is future-proofed against evolving user requirements.
•	Machine Learning Forecasting: The system could utilize historical transaction data alongside statistical linear regression and Machine Learning (e.g., Random Forest Regressors) to predict future expenses and provide long-term automated retirement planning projections.
•	Role-Based Access Control (RBAC): The system could establish multiple permission tiers (Super Admin, User, Guest), allowing administrators to oversee system health metrics without compromising individual user ledger privacy.
•	Data Export Capabilities: The system could allow users to generate and download comprehensive financial summary reports in PDF or CSV formats for external filing or tax preparation.

5.2 Non-Functional Requirements
Non-functional requirements (NFRs) specify the quality attributes, performance goals, and architectural parameters of the system (BrowserStack, no date). For this undergraduate capstone project, the following highly achievable and critical NFRs were established and successfully implemented:

5.2.1 Security & Data Integrity
Given the sensitivity of financial data, security was paramount. The system must securely hash all user passwords (utilizing `bcrypt`) before database insertion. Furthermore, it must implement stateless JSON Web Tokens (JWT) for secure session management and authorization routing, protecting endpoints from unauthenticated access. By explicitly avoiding external open-banking APIs, the system also inherently guarantees that user purchasing histories remain completely isolated from third-party commercial tracking.

5.2.2 Usability
The application must present an intuitive, frictionless user experience (UX) to prevent application fatigue. By utilizing React.js, the system must ensure cross-device responsiveness, gracefully adapting the UI from widescreen desktop monitors to mobile displays (Dey, 2026). Additionally, dynamic features like the AI Assistant must integrate smoothly via mouse and touch dragging (60fps performance) without obstructing primary data views or violating accessibility standards (e.g., retaining active ARIA labels) (W3C, 2018; Siteimprove, no date).
5.2.3 Maintainability
The codebase must be structured to allow future developers to easily read, update, or expand the system’s functionality. This is achieved through a heavily modular component-based architectural design on the frontend, separated Model-View-Controller (MVC) logic on the backend API (Dowen, 2023), and comprehensive inline commenting. Furthermore, the mandatory application of GitHub CI/CD methodologies ensures that any future code updates are automatically tested and validated before merging, maintaining systemic health.

5.3 Requirements Gathering Evidence
To transition abstract ideas into the concrete requirements listed above, empirical evidence was collected. The gathering process employed a mix of qualitative and quantitative mechanisms to ensure scientific rigor.

5.3.1 Conducting Interviews
Interviews provided deep, qualitative contexts regarding user frustrations. A formal, semi-structured interview protocol was authored covering five thematic domains (e.g., tracking practices, UI pain points, privacy boundaries). 26 specific participants were carefully selected, representing the target demographic (15 undergraduates, 8 early-career professionals, 3 financial experts). Conducting 20-to-30-minute sessions via video conferencing or in-person dialogues allowed the researcher to record spontaneous feedback, which directly highlighted the pervasive distrust of automated bank syncing, thereby establishing the "Must Requirement" for manual transaction logging.

5.3.2 Conducting Questionnaires
To capture broader statistical trends, a structured digital questionnaire was developed and deployed via Google Forms (titled "Smart Finance Tracker App – User Requirement Survey"). This survey was designed to quantify user behavior patterns that qualitative interviews might miss.
The questionnaire utilized a combination of multiple-choice selections and 5-point Likert-scale questions to measure the gap between perceived financial literacy and actual spending reality. Distributed across local university cohorts and professional networks, the survey garnered significant engagement. The aggregated data revealed that 68% of users chronically underestimated their recurring subscription costs. This specific statistical evidence directly reinforced the "Should Requirement" to implement highly visible, real-time visual breakdown charts and automated subscription tracking alerts within the platform

5.3.3 Conducting Observations (Competitive Analysis)
Observational gathering was executed through extensive heuristic evaluations and competitive benchmarking. Test accounts were established on existing commercial platforms, including MINT, YNAB, and PocketGuard. By directly navigating the user journeys of these apps, the researcher physically observed the friction points—such as forced paywalls, excessive advertising pop-ups, and complex jargon. These observations confirmed the necessity to build a cleaner, less punitive user interface.

5.3.4 Reviewing Existing Documents
Finally, extensive secondary document analysis was performed. This involved aggregating and evaluating established academic literature on behavioural finance, reviewing whitepapers compiled by global financial institutions (OECD, 2024), (World Bank, 2024), and studying contemporary software engineering texts regarding MERN stack capabilities (Suryavanshi, 2024). Reviewing this existing documentation provided the critical theoretical foundation validating concepts like "payment decoupling," mathematically justifying the necessity of the proposed platform's active-wide functionalities.



Chapter 06 – Design Chapter 

6.1 Overall System Architecture
6.1.1 Architecture Diagram
 




6.1.2 Architecture Explanation

| Layer | Technology | Responsibility |
|---|---|---|
| **Client** | React 18 + Vite + TailwindCSS | SPA rendering, routing, state management |
| **API Gateway** | Vercel (frontend) / Render (backend) | CORS, HTTPS termination, domain routing |
| **Backend** | Node.js 20 + Express | Business logic, 22 REST API controllers |
| **Auth** | JWT + bcrypt + 2FA (TOTP/OTP) | Token-based auth, OTP via email |
| **ML Service** | Python 3 + Flask | Expense forecasting & retirement simulation |
| **Database** | MongoDB Atlas | Primary NoSQL data store (20 collections) |
| **Queue** | Redis + BullMQ | Background jobs (bill reminders, reports) |
| **AI** | Google Gemini 1.5 Flash | Conversational AI assistant (Tracksy) |
| **Email** | Nodemailer + SMTP | Notifications, password reset, OTP |

6.2 Use Case Diagrams 
6.2.1 Authentication & User Management Module
 

6.2.2 Transaction & Wallet Module
 







6.2.3 Budget Management Module
 












6.2.4 Goals, Loans and Bills Module
  
6.2.5 AI, Analytics and Planning Module
 




6.3 Class Diagram — MongoDB Collections
 


6.4 Sequence Diagrams
6.4.1 User Registration and Email Verification
 
6.4.2 Add Expense Transaction
 

6.4.3 Peer-to-Peer Money Transfer
 

6.4.4 AI Chatbot Conversation — Tracksy
 

6.4.5 Expense Forecast via ML Service
 








6.5 Activity Diagrams
6.5.1 User Login with 2FA Flow
 
6.5.2 Budget Alert and Notification Process
 
6.5.3 Retirement Plan Calculation via Monte Carlo
 
6.6 Frontend UI — Figma Wireframe Reference


 6.7 Real Frontend UI — Screenshot Guide

> **📸 Take screenshots of the following actual running UI pages. Run the app first: `npm run dev` in `frontend/`**

### Screenshot Checklist:

| # | What to Screenshot | URL / Location |
|---|---|---|
| SS-01 | **Login Page** (dark mode) | `/login` |
| SS-02 | **Register Page** | `/register` |
| SS-03 | **Dashboard** — full view with all KPI cards | `/dashboard` |
| SS-04 | **Transactions Page** — with data loaded | `/transactions` |
| SS-05 | **Add Transaction Modal** | Click "+ Add" on transactions |
| SS-06 | **Budgets Page** — budget cards + progress bars | `/budgets` |
| SS-07 | **Goals Page** — goal cards | `/goals` |
| SS-08 | **Wallet Page** — balance + send money form | `/wallet` |
| SS-09 | **Transfer Hub** — OTP verification step | `/transfers` |
| SS-10 | **Analytics Page** — charts | `/analytics` |
| SS-11 | **Financial Health Page** — score + metrics | `/financial-health` |
| SS-12 | **Expense Forecast** — chart | `/forecasting` |
| SS-13 | **AI Chatbot** — Tracksy open with conversation | Click floating bot button |
| SS-14 | **Retirement Planner** — with results | `/retirement` |
| SS-15 | **Loans Page** — loan list | `/loans` |
| SS-16 | **Bills and Reminders** | `/bills` |
| SS-17 | **Settings Page** — profile tab | `/settings` |
| SS-18 | **Admin Dashboard** | `/admin` (login as admin role) |


6.8 Backend Architecture — API Structure

### REST API Endpoint Groups

| Module | Base Route | Key Endpoints |
|---|---|---|
| Auth and Users | `/api/users` | POST /register, POST /login, POST /2fa/verify, PUT /profile |
| Transactions | `/api/transactions` | GET, POST, PUT /:id, DELETE /:id |
| Wallet | `/api/wallet` | GET /balance, POST /deposit |
| Transfers | `/api/transfers` | POST /initiate, POST /confirm-otp, GET /history |
| Budgets | `/api/budgets` | GET, POST, PUT /:id, DELETE /:id |
| Goals | `/api/goals` | GET, POST, PUT /:id, DELETE /:id |
| Bills | `/api/bills` | GET, POST, PUT /:id, PATCH /:id/pay |
| Loans | `/api/loans` | GET, POST, POST /:id/payment, GET /:id/schedule |
| Analytics | `/api/financial-health` | GET /summary, GET /score |
| Forecasting | `/api/forecasting` | GET /predict |
| AI Chat | `/api/chat` | POST / send message |
| Retirement | `/api/retirement` | POST /plan, GET /plan/:id |
| Notifications | `/api/notifications` | GET, PATCH /:id/read, DELETE /:id |
| Admin | `/api/admin` | GET /users, PATCH /users/:id, GET /analytics |

### Backend Technology Stack Summary

```
Node.js 20 + Express 4
├── Authentication: jsonwebtoken + bcryptjs
├── Database ORM: Mongoose 8 (MongoDB)
├── Background Jobs: BullMQ + Redis
├── Email: Nodemailer (SMTP)
├── AI: @google/generative-ai (Gemini SDK)
├── Validation: express-validator
├── Security: helmet, cors, rate-limit
├── Testing: Jest + Supertest
└── ML Bridge: axios to Python Flask service
```


























Chapter 07 – Implementation (Development Chapter)
7.1 Development Environment and Technologies
The technical implementation of the Smart Financial Tracker (SFT) required a cohesive aggregation of robust development environments, modern programming languages, and scalable frameworks. 

7.1.1 Programming Languages and Frameworks
•	JavaScript (ECMAScript 2022+): Serving as the foundational language across the entire MERN stack. It was utilized both on the client-side to drive the user interface and on the server-side to handle the API gateway logic.
•	Python (Version 3.10+): Employed strictly for backend microservices to execute the complex mathematical operations required for statistical forecasting and Machine Learning regression.
•	Node.js (Version 20.x LTS) & Express.js (Version 4.18+): Provided the runtime environment and backend framework to rapidly build isolated, RESTful API endpoints and manage authentication middleware.
•	React.js (Version 18.x): Utilized for designing the single-page application (SPA) frontend, leveraging hooks (`useState`, `useEffect`, `useRef`) for real-time DOM manipulation without page reloads.
•	Mongoose (Version 7.x): Acted as the Object Data Modeling (ODM) library connecting the Node.js environment to the MongoDB Atlas cluster, enforcing schema validation (MongoDB, 2023).

7.1.2 Primary Development Environment
Integrated Development Environment (IDE): Visual Studio Code (VS Code) was the primary IDE, selected for its integrated terminal, ESLint formatting capabilities, and Git lens extensions.
Database Engine: MongoDB Atlas (Cloud-Hosted) was utilized as the NoSQL storage tier, providing high-availability clusters to manage JSON-like document data.
API Management & Testing: Postman was heavily utilized during development to rigorously test, configure, and validate backend RESTful endpoint structures (GET, POST, PUT, DELETE) before implementing them into the React frontend.

7.2 Main Module Development Algorithms
7.2.1 Peer-to-Peer (P2P) Wallet Transfer Algorithm
Algorithm Flow Description:
To ensure financial integrity, the internal digital wallet was engineered utilizing “Atomic Transactions” and “Double-Entry Accounting” principles (Taduka, 2024). The algorithmic flow is as follows:
1.	Initiation: The system receives a transfer request (Sender ID, Receiver ID, Amount).
2.	Validation: The backend verifies both identities and checks if the sender’s wallet balance is `≥` the requested amount.
3.	Atomic Session Start: A MongoDB transaction session initializes. If any step fails, the entire transaction rolls back to prevent money from disappearing.
4.	Deduction & Addition: The algorithm deducts the amount from the Sender’s balance and simultaneously adds it to the Receiver’s balance.
5.	Ledger Creation: Two distinct ledger logs are generated (a 'Debit' record for the sender and a 'Credit' record for the receiver).
6.	Commit: The session is successfully committed, writing all data to the database permanently.

Implementation Code Snippet (Wallet Controller):
// P2P Wallet Transfer Implementation - Atomic Transaction
const processWalletTransfer = async (req, res) => {
    const { receiverId, amount } = req.body;
    const senderId = req.user.id;
    
    // 1. Initialize atomic session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Validate and fetch accounts within session
        const sender = await Wallet.findOne({ user: senderId }).session(session);
        const receiver = await Wallet.findOne({ user: receiverId }).session(session);

        if (sender.balance < amount) {
            throw new Error('Insufficient wallet balance.');
        }

        // 3. Execute balance updates
        sender.balance -= amount;
        receiver.balance += amount;
        await sender.save({ session });
        await receiver.save({ session });
// 4. Generate double-entry ledger logs
        await TransactionLog.create([{
            wallet: sender._id, type: 'DEBIT', amount: amount, relatedUser: receiverId
        }], { session });
        
        await TransactionLog.create([{
            wallet: receiver._id, type: 'CREDIT', amount: amount, relatedUser: senderId
        }], { session });

        // 5. Commit transaction permanently
        await session.commitTransaction();
        res.status(200).json({ success: true, message: 'Transfer completed.' });

    } catch (error) {
        // Rollback state if any database operational error occurs
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};
7.2.2 Machine Learning Forecasting Algorithm (Python Microservice)
Algorithm Flow Description:
To combat static historical reporting, a predictive algorithm was programmed in Python.
1.	Data Extraction: An authorized API call requests the user’s last 12 months of categorized expenditure data from the Node.js backend.
2.	Pre-processing: The Python microservice restructures the JSON array into a Pandas DataFrame, stripping anomalies.
3.	Model Training: The system initializes a Scikit-Learn `LinearRegression` model. The X-axis represents the chronological time progression (e.g., month index), and the Y-axis represents total expenditure (Montgomery, Peck and Vining, 2012).
4.	Prediction Output: The model is tasked to predict values for indices N+1 and N+2 (the upcoming two months).
5.	Payload Return: The predicted numeric values are formulated into a JSON payload and returned to the React frontend to be mapped onto a forecast line graph.
Implementation Code Snippet (Python ML Service):
# Linear Regression Expenditure Forecast Implementation
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

app = Flask(__name__)

@app.route('/api/forecast', methods=['POST'])
def generate_expense_forecast():
    try:
        # 1. Parse historical transaction payload
        data = request.json['historicalData']
        df = pd.DataFrame(data)
        
        # 2. Reshape data arrays for Scikit-Learn (X=Time, y=Amount spent)
        X = np.array(df['month_index']).reshape(-1, 1)
        y = np.array(df['total_amount'])
        
        # 3. Initialize and train the regression model
        model = LinearRegression()
        model.fit(X, y)
 
        # 4. Forecast the upcoming two financial periods
        next_periods = np.array([[len(df) + 1], [len(df) + 2]])
        predictions = model.predict(next_periods)
        
        # 5. Return standardized forecast object
        return jsonify({
            "status": "success",
            "forecast": {
                "month_plus_one": round(predictions[0], 2),
                "month_plus_two": round(predictions[1], 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

7.2.3 Draggable AI Assistant Algorithm (UI Logic)
Algorithm Flow Description:
To ensure high usability without blocking the dashboard, an interactive viewport constraints algorithm was designed for the React client.
•	User Input: The UI detects `onMouseDown` or `onTouchStart` events on the chat widget.
•	Delta Calculation: As the cursor moves, `onMouseMove` triggers a `requestAnimationFrame` recalculating the X/Y coordinates relative to the initial click.
•	Boundary Enforcement: Before applying new style coordinates, the algorithm checks against the browser window's `innerWidth` and `innerHeight` to ensure the widget cannot be dragged off-screen.
•	State Update: The new validated coordinates are applied directly via `useRef` to maintain a consistent 60 Frames-Per-Second (fps) render without causing the whole application DOM to re-render.

Implementation Code Snippet (React Component):
// Viewport Boundary Constraints Implementation - React Component
const handleDragMove = (e) => {
    if (!isDragging.current) return;
    
    // 1. Calculate active pointer coordinates
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 2. Determine raw new position
    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;
    
    // 3. Enforce strict mathematical viewport boundaries
    const widgetWidth = 60; // 60px widget diameter
    const padding = 15;     // 15px edge buffer
    
    const maxX = window.innerWidth - widgetWidth - padding;
    const maxY = window.innerHeight - widgetWidth - padding;
    
    // Clamp constraints
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));
    
    // 4. Paint to DOM without React State re-render for high performance
    widgetRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
};
Chapter 08 – System Testing and Evaluation
8.1 Introduction to the Testing Strategy
Testing and evaluation form a critical phase of the software development lifecycle, ensuring that the Smart Financial Tracker (SFT) is robust, secure, and user-friendly. While automated toolchains (like Jest, Vitest, and Playwright) were utilized to establish a stable deployment baseline, “Manual Testing” was positioned as the primary evaluation methodology. Because the system's core value relies on active behavioural engagement and usability, executing structured manual walkthroughs acting as a real user was considered a core project deliverable. All test cases in this chapter are strictly documented using the “Acceptance format (Given / When / Then)” to map business logic directly to executable conditions.

8.2 Unit Testing
Unit testing involves isolating distinct components, functions, or modules of the codebase to verify their operational logic independently from the rest of the application. In the SFT, backend unit testing was executed to validate mathematical logic (such as wallet deductions) and frontend component isolation.

Acceptance Test Case: P2P Wallet Insufficient Funds Validation
•	Scenario: Preventing an overdraft during a local wallet transfer.
•	Given: The registered user currently has a verified wallet balance of $50.00.
•	When: The user manually inputs a transfer request to send $100.00 to a peer.
•	Then: The isolated backend wallet controller must halt the process and return a specific "Insufficient balance" error response without touching the database ledger.

8.3 Integration Testing
Integration testing evaluates how distinct microservices, databases, and APIs interact when combined. For the SFT, the most critical integration testing involved verifying the data flow between the Node.js API gateway, the Python Machine Learning service, and the MongoDB database.

Acceptance Test Case: Python ML Forecast Microservice Integration
•	Scenario: Connecting the Node.js transaction ledger to the Python predictive engine.
•	Given: The user has logged a minimum of 12 months of structured transaction history in the MongoDB database.
•	When: The React frontend dashboard requests a future projection, triggering the Node.js backend to securely pass the ledger array to the Python ML microservice.
•	Then: The Python microservice and Scikit-Learn engine must successfully receive the array, process the linear regression mathematically, and cleanly return a JSON payload with the predictions back to the frontend without a CORS (Cross-Origin Resource Sharing) or timeout error.


8.4 System Testing (Manual Testing Focus)
System testing validates the completely assembled, fully integrated application. Because human interaction and interface friction are central themes of the project, exhaustive “Manual System Testing” served as the primary verification deliverable. Every core user workflow was manually executed step-by-step through the browser to simulate actual daily application usage.

Acceptance Test Case: Full Cycle Transaction Logging and Budget Alert
•	Scenario: End-to-end validation of manual data entry triggering a reactive UI alert.
•	Given: The user has established a monthly "Groceries" budget capped at $200.00, and their current recorded grocery expenditure stands at $190.00.
•	When: The user navigates the application interface and manually submits a new Grocery expense form for $20.00 (pushing the total to $210.00).
•	Then: The system must visually append the transaction to the ledger, recalculate the total immediately on screen, and physically render a red UI notification stating "100% Budget Exceeded" to the user.

8.5 User Acceptance Testing (UAT)
User Acceptance Testing shifts the evaluation from the developer to the actual target demographic. To conduct UAT, the system was temporarily hosted in a staging environment. Digital feedback surveys (utilizing Google Forms) were formulated and distributed to a closed testing group comprising classmates, friends, and independent university peers representing the core target audience. They were tasked to use the P2P wallet and the AI assistant, then provide qualitative responses regarding application logic and friction.

Acceptance Test Case: Draggable AI Assistant Interaction
•	Scenario: Target demographic retrieving financial awareness guidance.
•	Given: A beta tester (friend) is navigating the main transaction dashboard.
•	When: The tester clicks on the Draggable AI widget and inputs the unstructured query, "How can I cut down on my daily spending?"
•	Then: The natural language model must process the query and output a concise, non-financial-advice tip within a 5-second response window, and the tester must rate the response as "Helpful" on the UAT survey form.

8.6 Non-Functional Testing
While functional tests verified ‘what’ the system does, non-functional testing examined ‘how well’ the system performs under constraints. Software profiling applications and browser tools were utilized to explicitly test baseline usability, load speeds, and API security.

8.6.1 Performance and Usability Testing
Google Lighthouse (an automated open-source app within Chrome DevTools) was utilized to audit the performance of the React DOM.
•	Scenario: Client-side load performance on modern browsers.
•	Given: The web application is deployed in a production-like build state.
•	When: The Lighthouse app executes a comprehensive metrics diagnostic test on the main dashboard.
•	Then: The application must receive a performance score exceeding 85/100, verifying that manual entry forms load fast enough to prevent user frustration.

8.6.2 Security and Access Control Testing
Postman was leveraged as the application tool to manually simulate malicious requests, testing the system's JWT authentication shielding.
•	Scenario: Unauthorized data access attempt.
•	Given: A guest user who does not possess a valid, signed JSON Web Token (JWT) in their browser cookies.
•	When: The guest bypasses the UI and attempts to directly request user wallet data by hitting the `/api/wallet/balance` backend endpoint via Postman.
•	Then: The server's authentication middleware must intercept the request and deflect it, responding with a `401 Unauthorized` HTTP status code in under 200 milliseconds (OWASP, 2023).


Chapter 09 – End Project Report
9.1 Project Summary
The Smart Financial Tracker (SFT) was conceived and developed to directly address the "invisible economy" phenomenon, wherein the seamless nature of modern digital transactions fundamentally deteriorates an individual's cognitive awareness of their spending. Recognizing that the target demographic (emerging adults and university students) was severely underserved by an ecosystem of applications that were either too rigorously complex (YNAB) or entirely too automated (Mint/Credit Karma), the SFT was engineered to occupy a crucial behavioural middle ground. 

Utilizing the monolithic MERN stack (MongoDB, Express.js, React.js, Node.js), the SFT delivers a highly secure, privacy-first web platform. It actively enforces financial accountability by requiring structured manual transaction logging, while simultaneously rewarding that manual effort with enterprise-grade, real-time visual analytics. Furthermore, the integration of Python microservices executing Scikit-Learn Machine Learning regression algorithms, alongside a Large Language Model (LLM) powered "Draggable Assistant," transforms the project from a reactive digital ledger into a highly proactive, intelligent financial forecasting tool. Finally, integrating a Peer-to-Peer (P2P) wallet directly into the architecture successfully bridged the gap between individualized wealth tracking and shared financial realities.

9.2 Achievements and Self-Evaluation
An essential aspect of the end-project evaluation requires a critical, honest self-assessment regarding the fulfilment of the predefined objectives and the execution of the established scope. 

9.2.1 Evaluation of Objectives
•	Objective 1 (Fully Achieved): The core CRUD transaction engine with highly customizable categorization was successfully developed and deployed as the system's foundational layer.
•	Objective 2 (Fully Achieved): The intelligent budgeting configuration was engineered to successfully emit progressive, real-time UI threshold alerts at 80%, 90%, and 100% capacity triggers, actively facilitating behavioural spending correction.
•	Objective 3 (Fully Achieved): A high-security internal digital wallet was deployed utilizing atomic database sessions and double-entry accounting to ensure mathematically sound P2P transfers between system users.
•	Objective 4 (Fully Achieved): Advanced algorithmic analytics were established via an isolated Python microservice, successfully reading historical user datasets to cast mathematical linear regressions for short-term and long-term expense forecasting.
•	Objective 5 (Unachieved / Deliberately Scoped Out): The original proposal briefly considered the inclusion of direct, automated bank API synchronization. Upon deeper technical and heuristic investigation, this objective was intentionally unachieved and removed from the active scope. Building open-banking integrations presented massive licensing costs and breached the privacy limits requested by users during interviews. Crucially, automating the data entry directly conflicted with the core psychological goal of the project: maintaining the user’s cognitive, manual engagement to build healthy financial habits.

9.2.2 Evaluation of Scope
The functional scope detailed in the Project Initiation Document (PID) was successfully fully realized. The complete frontend interface was built, and the backend routing dynamically handles the user base precisely as intended without systemic crashes. Experimental scope items, particularly the boundary-constrained, hovering "Draggable AI Assistant," overperformed expectations, smoothly maintaining 60 frames-per-second while querying the hosted Groq API models to provide conversational context. The project remained strictly within academic timelines, transitioning successfully from design to an evaluative build state.

9.3 Customer and Target User Feedback
To validate the system’s real-world viability, the closed beta phase integrated rigorous User Acceptance Testing (UAT) executed by university peers representing the core software demographic. The qualitative feedback gathered through comprehensive survey forms was highly positive, highlighting specific validations of the system’s design choices:
1.	Privacy and Trust: A dominant theme in the UAT feedback was extreme satisfaction regarding the ‘lack’ of imposed bank syncing. Users explicitly noted that the isolated, manual-entry nature of the SFT felt significantly safer than commercial alternatives, relieving anxieties about their purchasing data being harvested or commodified.
2.	Dashboard Clarity: Users highly rated the dynamic React visual dashboards. Feedback indicated that the pie charts and line graphs immediately clarified where their disposable income was deteriorating, specifically highlighting previously unnoticed recurring subscription fees.
3.	Chatbot Usability: The Draggable AI Assistant received highly enthusiastic feedback regarding interface usability. Testers found the ability to quickly ask the bot regarding generic budgeting strategies (e.g., "explain the 50/30/20 budget rule") while concurrently viewing their ledger prevented them from having to open new browser tabs, keeping them completely focused on their financials.
4.	Areas for Polish: Minor critical feedback was logged primarily concerning the mobile viewport interface. Some users noted that while the draggable widgets responded perfectly on desktop, dragging elements near the bottom navigation bar on narrower touchscreen phones occasionally caused overlapping, prompting minor CSS media query refinements prior to final deployment (Elementor, no date).

9.4 User Benefits
The delivery of the Smart Financial Tracker provides robust, tangible benefits explicitly designed to counteract the modern financial pressures affecting users:
•	Restoration of Cognitive Financial Awareness: By enforcing manual entry of expenses, the system physically replaces the friction lost by cashless "tap-to-pay" cards. Users are actively re-engaged with the reality of their lifestyle costs, directly decreasing impulsive expenditures.
•	Proactive Avoidance of Debt: Shifting users out of a reactive state is the SFT's foundational benefit. By seeing a budget notification at 80% utilization rather than an overdraft notice at 105%, users gain the temporal bandwidth required to modify behaviour, minimizing debt-accrual.
•	Elimination of App Fatigue: Users no longer need to triangulate their financial reality across a specialized budgeting app, a separate P2P transfer app (like Venmo), and generic bank portals. The SFT unifies isolated individual wealth with shared financial management in a single browser window.
•	Enterprise AI Forecasting at Zero Cost: Perhaps the most significant baseline benefit is accessibility. The system democratizes advanced data visualization and machine-learning trend forecasting, providing enterprise-level tools completely free to an economically vulnerable demographic that currently cannot afford the high subscription tiers of market leaders like YNAB (Bitcot, 2026).

Chapter 10 – Project Post-Mortem (Reflection)
10.1 Introduction to Project Reflection
A Post-Mortem analysis provides a structured, critically reflective review of the entire Software Development Life Cycle (SDLC) executed during this capstone project. Stepping back from the active codebase enables a comprehensive evaluation of the methodological successes, the technical barriers encountered, and the broad spectrum of professional competencies cultivated during the creation of the Smart Financial Tracker (SFT).

10.2 Technical Skill Development and Technologies Learned
The most profound outcome of this project was the transition from a theoretical understanding of computer science principles to the practical, engineered execution of a full-stack, distributed web application.

10.2.1 Core Framework Mastery (The MERN Stack)
Prior to this project, my exposure to web development consisted primarily of isolated, front-end scripts or basic database queries. Developing the SFT required mastering the MERN stack cohesively:
•	React.js: I developed a deep practical understanding of the React Component Lifecycle, specifically how to manage and protect application state utilizing native hooks (`useState`, `useEffect`, `useRef`). I learned the critical importance of preventing unnecessary DOM re-renders, particularly when building high-performance interactives like the Draggable AI assistant, applying `requestAnimationFrame` to ensure 60fps smoothness.
•	Node.js & Express.js: I cultivated secure backend engineering skills. Specifically, I learned the mechanics of building stateless RESTful APIs, configuring CORS policies, and, crucially, integrating complex authentication middleware using bcrypt for password hashing and JSON Web Tokens (JWT) for secure route protection.
•	MongoDB & Mongoose: I advanced my backend data modeling capabilities, learning how to engineer flexible NoSQL database schemas capable of handling user-defined categorization without the strict structural limitations inherent in relational SQL servers.

10.2.2 Machine Learning and External Integrations
Python Microservices (Scikit-Learn): A significant technical leap involved stepping outside the JavaScript ecosystem to construct dedicated mathematical microservices using Python. I learned how to clean raw JSON payloads into Pandas DataFrames and practically implement `LinearRegression` algorithms to forecast expenditure trends from historical data.
LLM API Integration: By integrating the Groq API to power the system's chatbot, I acquired the skills to properly handle asynchronous external API fetches, manage API rate-limiting delays within the UI efficiently (using visual loading states), and securely hide private access keys utilizing environment (`.env`) variables.

10.3 Identifying Technological Limitations
Constructing the system exposed several inherent limitations and bottlenecks associated with the selected technologies, teaching me vital lessons in architectural compromise:
React.js (Client-Side Rendering Limits): While React allows for rapid, dynamic user interfaces, it strictly performs Client-Side Rendering (CSR). I discovered that offloading too much heavy mathematical processing (like array filtering large transaction ledgers) to the client’s browser degraded performance on weaker mobile devices. This limitation forced me to refactor the architecture, pushing the heavy data aggregation loads back onto the Node.js server before it shipped the data to React.
MongoDB (Transaction Isolation): Creating the P2P Wallet highlighted a structural limitation within standard NoSQL databases. Unlike SQL databases that inherently excel at transactional safety, using MongoDB for digital wallets required writing extensive, highly explicit `startSession()` code architecture to legally enforce Atomic Transactions (ensuring money couldn't be deducted from one wallet without successfully arriving in another if the server crashed mid-request).

10.4 Soft Skill and Professional Development
The solitary nature of a final-year academic capstone project acts as an accelerated incubator not only for coding logic but for fundamental professional soft skills.

10.4.1 Agile Project Management and Discipline
Executing the project using the Agile methodology instilled a high degree of structural discipline. I learned how to break down massive, intimidating concepts (like "Build a secure P2P wallet") into granular, two-week actionable sprints on a GitHub Kanban board. This skill of accurate time estimation, backlog prioritization, and maintaining steady momentum without burning out is highly translatable to the commercial software industry.

10.4.2 Problem-Solving and Resilience
Debugging multi-tiered application errors provided rigorous training in logical deduction and resilience. Tracking down a data failure where the React frontend crashed because the Node API failed to wait for the Python microservice response required systematic analysis traversing three different languages. I learned to stop blindly altering code and instead rely logically on console logs, Postman network traces, and Chrome developer tools to isolate the exact point of architectural failure.

10.4.3 Stakeholder Communication and Empathy
Conducting the requirements gathering phase and User Acceptance Testing (UAT) significantly enhanced my professional empathy. Formally interviewing university peers regarding their financial stress and translating those qualitative human anxieties into rigid functional coding requirements taught me the core tenet of user-centric design: software must be engineered to solve the human problem in front of the screen, rather than just satisfying the technical curiosity of the developer behind it.


Chapter 11 – Conclusion
11.1 Final Project Summary
The overarching objective of this final-year project was to engineer a solution that actively counteracts the "invisible economy" facilitated by modern, frictionless digital transactions. The Smart Financial Tracker (SFT) was successfully developed as a secure, full-stack personal finance management application that rejects the industry trend of total automation in favor of cognitive financial engagement.

Over the course of the Software Development Life Cycle, the project successfully deployed a robust monolithic architecture utilizing the MERN stack (MongoDB, Express.js, React.js, Node.js). The system fully realizes its core functional requirements: it provides a highly secure methodology for users to manually log and categorize transactions, calculates remaining fiscal balances in real-time, and generates dynamic visual dashboards. The application goes beyond passive data registry by introducing an intelligent budgeting mechanism that progressively notifies users at critical expenditure thresholds (80%, 90%, 100%), granting them the necessary temporal window to enforce behavioural spending correction.

Furthermore, the system successfully bridged the analytical gap prevalent in consumer-grade applications. By establishing isolated Python microservices, the SFT leverages machine learning (Scikit-Learn Linear Regression) to mathematically predict future financial constraints based on historical logging. This was combined with the client-side integration of a Large Language Model (Groq API) via the "Draggable Assistant," creating an interactive environment where users receive immediate, contextual financial awareness guidance. Lastly, implementing an internal, cryptographically secure digital wallet equipped with atomic transactions allows users to trace and resolve shared peer-to-peer (P2P) commitments cleanly within the single SFT ecosystem.

The project adhered strictly to the Agile methodology, utilizing GitHub for continuous iteration and version control. Through rigorous manual system testing and User Acceptance Testing (UAT), the SFT was validated mathematically and behaviourally, successfully demonstrating that manual cognitive friction combined with enterprise-grade data visualization produces superior financial visibility for emerging adults.

11.2 Main Limitations
Despite the successful deployment and stabilization of the platform, the current iteration possesses distinct limitations bound by the academic and technical constraints of the project timeline.

Absence of API Bank Synchronization: As actively determined during the requirements gathering phase, automated bank syncing was excluded to protect privacy and promote manual behavioural engagement. However, for a subset of power users handling highly complex digital portfolios, explicitly requiring every micro-transaction to be logged manually presents a definitive friction point that could theoretically lead to system abandonment over extended, multi-year timelines.
Lack of Live Multi-Currency Conversion Analytics: While the system successfully allows individual users to select and configure their preferred global display currency (e.g., LKR, USD, GBP) within their profile settings, the mathematical backend processes all ledgers using a static numerical value based entirely on that single selection. For users who travel frequently or manage international accounts, the system does not actively support logging transactions in a secondary currency, nor does it integrate with real-time financial APIs to automatically convert foreign exchange rates at the point of ledger entry (Fixer.io, no date).
Mobile Web View vs. Native Application: The application was constructed as a fully responsive Web App using React.js. While it scales beautifully in mobile browser viewports (Safari/Chrome), it lacks the deep, hardware-level integration (e.g., Apple Pay integrations, native push notifications outside the browser, or offline cache operating modes) inherently available only in compiled, native iOS or Android mobile applications.

11.3 Future Suggestions and Enhancements
To elevate the Smart Financial Tracker from a robust academic platform to a highly competitive, commercial-grade product, several technological and functional enhancements are proposed for future development life cycles:

1.	Optical Character Recognition (OCR) Integration: To alleviate the friction of manual data entry without resorting to automated bank syncing, the system should integrate an OCR engine (such as Google Cloud Vision or Tesseract). This would allow users to physically take a photograph of their point-of-sale receipt with their mobile device; the OCR would mathematically scan the image, extract the total cost and vendor data, and auto-populate the SFT input form, requiring only a final manual confirmation click from the user.
2.	Migration to React Native: To resolve the mobile Web App limitations, the frontend architecture should be refactored utilizing React Native. This would allow the project to be compiled and deployed directly to the iOS App Store and Google Play Store. It would grant the system access to native mobile hardware APIs, permitting offline operational caching (Redis, 2024), biometric (FaceID) login security, and hardware-level push notifications for immediate budget alerts.
3.	Expanded Predictive Models and Backtesting: The Python microservices should be expanded beyond basic Linear Regression. Integrating advanced time-series forecasting models (such as ARIMA or LSTM neural networks) would allow the system to account for complex seasonal expenditure variations (e.g., accurately predicting the spike in winter holiday spending based on data from three years prior), drastically improving the fidelity of long-term retirement forecasts.












Chapter 12 – References

Deloitte (2023) 'Digital Financial Ecosystems: The Future of Personal Finance', Deloitte Insights. Available at: https://www2.deloitte.com/insights/us/en.html (Accessed: 10 May 2026).

Experian (2026) 'The Evolution of Free Budgeting Tools', Experian Financial Reports. Available at: https://www.experian.com/blogs/ask-experian/ (Accessed: 10 May 2026).

Federal Reserve (2024) 'Consumer Behavior in the Digital Payment Age', Federal Reserve Bulletin. Available at: https://www.federalreserve.gov/publications.htm (Accessed: 10 May 2026).

MongoDB (2023) 'Building Robust Data Architectures with MongoDB Atlas', MongoDB Whitepapers. Available at: https://www.mongodb.com/collateral (Accessed: 10 May 2026).

Montgomery, D.C., Peck, E.A. and Vining, G.G. (2012) Introduction to Linear Regression Analysis. 5th edn. New York: John Wiley & Sons.

NerdWallet (2026) 'Zero-Based Budgeting: Why It Works', NerdWallet Personal Finance. Available at: https://www.nerdwallet.com/article/finance/zero-based-budgeting-explained (Accessed: 10 May 2026).

OECD (2024) 'Financial Literacy in the Digital Age', OECD Financial Education Studies. Available at: https://www.oecd.org/financial/education/ (Accessed: 10 May 2026).

OWASP (2023) 'Top 10 Web Application Security Risks', Open Web Application Security Project. Available at: https://owasp.org/www-project-top-ten/ (Accessed: 10 May 2026).

Pressman, R.S. (2020) Software Engineering: A Practitioner's Approach. 9th edn. New York: McGraw-Hill Education.

Santander UK (2025) 'The Student Financial Reality Report', Santander Research. Available at: https://www.santander.co.uk/about-santander/media-centre/press-releases (Accessed: 10 May 2026).

Sommerville, I. (2021) Software Engineering. 11th edn. Boston: Pearson.

Suryavanshi, P. (2024) 'Mastering the MERN Stack: A Comprehensive Guide', Medium. Available at: https://medium.com/@suryavanshi/mern-stack-guide (Accessed: 10 May 2026).

Taduka, S. (2024) 'Atomic Transactions in Modern Web Applications', Tech Innovations Journal, 12(4), pp. 45-59.

Thaler, R.H. and Sunstein, C.R. (2008) Nudge: Improving Decisions About Health, Wealth, and Happiness. New Haven: Yale University Press.

World Bank (2024) 'Global Financial Inclusion and Consumer Empowerment', World Bank Group. Available at: https://www.worldbank.org/en/topic/financialinclusion (Accessed: 10 May 2026).

Academy Bank (2024) 'The Psychology of Savings: Milestone-Based Goal Setting', Academy Bank Financial Resources. Available at: https://www.academybank.com/blog/ (Accessed: 10 May 2026).

Alea IT Solutions (2025) 'Proactive vs Reactive FinTech Solutions in Modern Banking', Alea IT Whitepapers. Available at: https://www.aleaitsolutions.com/ (Accessed: 10 May 2026).

Bitcot (2026) 'Cost-Benefit Analysis of Open Source Stacks in SaaS', Bitcot Engineering. Available at: https://www.bitcot.com/ (Accessed: 10 May 2026).

BrowserStack (no date) 'Defining and Testing Non-Functional Requirements', BrowserStack Guides. Available at: https://www.browserstack.com/ (Accessed: 10 May 2026).

Byrne, A. and Brooks, C. (2008) 'Behavioral Finance: Theories and Evidence', The Research Foundation of CFA Institute.

CSAC (2025) 'Student Affordability and the Rising Cost of Living', California Student Aid Commission. Available at: https://www.csac.ca.gov/ (Accessed: 10 May 2026).

Dey, S. (2026) 'Mobile-First Design in FinTech Application Development', UX Design Quarterly, 14(2), pp. 22-35.

Dowen, B. (2023) 'What makes up a software stack', Ben Dowen Blog. Available at: https://www.dowen.me.uk/posts/what-makes-up-a-software-stack/ (Accessed: 10 May 2026).

Elementor (no date) 'Mobile Viewport Optimization and Media Queries', Elementor Resources. Available at: https://elementor.com/ (Accessed: 10 May 2026).

Enfin Technologies (no date) 'Why Choose the MERN Stack for Startup Development?', Enfin Tech Blog. Available at: https://www.enfintechnologies.com/ (Accessed: 10 May 2026).

Fixer.io (no date) 'Foreign Exchange Rates and Currency Conversion API', Fixer Documentation. Available at: https://fixer.io/ (Accessed: 10 May 2026).

Huxley, J. (2022) 'A Review of Personal Financial Management Systems', Journal of Financial Technology, 8(1), pp. 112-128.

IMF (2024) 'Digital Money and the Future of the Global Financial System', International Monetary Fund. Available at: https://www.imf.org/ (Accessed: 10 May 2026).

Kahneman, D. (2011) Thinking, Fast and Slow. New York: Farrar, Straus and Giroux.

MyBankTracker (2024) 'The Shift in Budgeting Apps: Mint to Credit Karma', MyBankTracker Analysis. Available at: https://www.mybanktracker.com/ (Accessed: 10 May 2026).

NCAN (2024) 'Financial Hardship Among College Students', National College Attainment Network. Available at: https://www.ncan.org/ (Accessed: 10 May 2026).

Reddit (no date) 'Hosting MERN Apps for Free: A Developer Guide', r/webdev Community. Available at: https://www.reddit.com/r/webdev/ (Accessed: 10 May 2026).

Redis (2024) 'Caching Strategies for High-Performance APIs', Redis Documentation. Available at: https://redis.io/docs/ (Accessed: 10 May 2026).

Sentry (2024) 'Monitoring API Latency and Performance Bottlenecks', Sentry Engineering. Available at: https://sentry.io/ (Accessed: 10 May 2026).

Siteimprove (no date) 'WCAG Compliance for Financial Institutions', Siteimprove Accessibility Guidelines. Available at: https://siteimprove.com/ (Accessed: 10 May 2026).

SourceForge (no date) 'Node.js: Asynchronous I/O and Performance Benchmarks', SourceForge Software Reviews. Available at: https://sourceforge.net/ (Accessed: 10 May 2026).

W3C (2018) 'Web Content Accessibility Guidelines (WCAG) 2.1', World Wide Web Consortium. Available at: https://www.w3.org/TR/WCAG21/ (Accessed: 10 May 2026).

Xiao, J.J. and O’Neill, B. (2018) 'Mental Accounting and Behavioral Finance in Financial Education', Journal of Financial Counseling and Planning, 29(1), pp. 4-15.
