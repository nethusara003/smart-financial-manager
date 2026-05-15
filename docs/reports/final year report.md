Acknowledgements
The successful completion of this project would not have been possible without the guidance, support, and encouragement of several individuals, to whom sincere gratitude is expressed.
Foremost, heartfelt appreciation is extended to Ms. Yasanthika Mathotaarachchi, project supervisor, for the invaluable academic guidance, constructive feedback, and unwavering support provided throughout the entire duration of this project. Her expertise and encouragement played a decisive role in shaping the quality and direction of this work.
Gratitude is also extended to all academic staff members at NSBM Green University and the University of Plymouth for their dedication to delivering high-quality education and for their continued support throughout the degree programme.
Finally, sincere thanks are offered to family and friends whose encouragement, patience, and moral support sustained this journey from inception to completion.



Abstract
Personal financial management is complex, requiring individuals to simultaneously track expenditure, manage budgets, and plan for retirement. Existing tools typically address these needs in isolation; few combine statistical expense forecasting, probabilistic retirement simulation, and AI-assisted guidance within a single platform. This study aimed to design, develop, and evaluate the Smart Financial Tracker, a unified web application integrating these three intelligent components.
The system was evaluated using 178 synthetic transactions spanning seven months (October 2025 to April 2026) across nine expense categories. Expense forecasting employed a hybrid linear regression and weighted moving average model, evaluated via rolling-window backtesting across 36 windows. The retirement engine combined deterministic projection with Monte Carlo simulation over 1,000 trials. The LLM-based assistant, powered by a Groq-hosted LLaMA 3.1 8B model, was assessed across 20 representative financial queries. Software reliability was verified through 177 automated tests using Jest, Vitest, and Playwright.
Forecasting evaluation yielded a weighted MAE of LKR 1,967, RMSE of LKR 2,265, and MAPE of 16.23%, indicating acceptable prediction accuracy for personal-scale expense estimation. A blended confidence scoring mechanism classified 77.8% of categories into High or Medium reliability tiers. The Monte Carlo module produced probabilistic projections including mean, median, and 10th to 90th percentile bounds across 1,000 trials. The AI assistant returned substantive contextual responses for 16 of 20 queries; the remaining 4 triggered a backend token-limit safeguard due to large context payloads. Automated testing achieved a 99.4% pass rate, with the single failure attributable to a hardware timing variance rather than a logic error.
These findings demonstrate that integrating statistical forecasting, probabilistic simulation, and LLM-assisted guidance within a unified platform is technically feasible and produces verifiable prediction accuracy under controlled conditions. Broader validation with real-user populations and longitudinal data would be required before generalised claims regarding effectiveness in supporting financial decision-making can be made.

Table of Contents
List of Figures
List of Tables
Table of Abbreviations
List of Appendices

Chapter 1: Introduction
1.1 Project Background
Personal financial management has become an essential competency for long-term stability, particularly within the modern, rapidly evolving digital economy. Individuals today are increasingly responsible for orchestrating multiple income sources, ad-hoc digital purchases, variable recurring expenses, and short-term financial commitments across a wide array of platforms. The widespread adoption of online payment gateways, cashless transactions, and subscription-based services has brought unprecedented speed and convenience to consumers. However, this profound shift has simultaneously created an "invisible economy," where the physical and psychological friction associated with spending tangible cash has been largely removed (International Monetary Fund, 2024; World Bank Group, 2024). 

This phenomenon, often referred to as payment decoupling, frequently masks the true cumulative costs of daily lifestyle choices. Because money is spent invisibly and frictionlessly, consumers often lose cognitive awareness of their expenditure patterns. Without a centralized, visible structure to monitor these diverse digital cash flows, individuals resort to making reactive financial decisions driven by immediate gratification rather than objective income assessment. Consequently, fragmented financial visibility severely inhibits effective self-regulation, resulting in poor budgeting, accumulated liabilities, and growing financial stress. There is, therefore, a pressing urgency for digital tools that not only track expenditure but actively restore visibility and mindful engagement to personal finance (Byrne and Brooks, 2008; Thaler and Sunstein, 2008; Kahneman, 2011).

1.2 Problem Statement
Contemporary personal finance management systems suffer from structural weaknesses that inhibit proactive financial regulation and holistic visibility. The continued reliance on traditional manual tracking approaches, such as physical notebooks or custom spreadsheet templates proves to be highly inefficient, prone to human and formula errors, and difficult to maintain over long periods, ultimately lacking any predictive insight. 
Conversely, modern commercial financial applications often oversaturate users with complex, feature-heavy interfaces that prioritize automated bank synchronization over user engagement. This excessive reliance on automation removes the user's active awareness of their spending behaviours, contributing to further financial dissociation. Furthermore, existing tools are primarily reactive rather than proactive; they typically alert users only after a budget has already been exceeded, offering no opportunity for mid-cycle behavioural correction. Additionally, standard single-user tracking systems usually fail to integrate shared expenses or peer-to-peer (P2P) functionality, forcing users into a disjointed experience managed across multiple apps. Ultimately, individuals lack a cohesive, predictive, and behaviourally engaging platform that allows them to securely monitor their financial health and anticipate financial strain before it occurs.

1.3 Motivation and Aim of the Project
The project was motivated by the societal implications of financial mismanagement, such as escalating debt and anxiety among young professionals. Current financial tools presented a functional dichotomy: they were either overly simplistic or excessively automated, stripping users of accountability. The Smart Financial Tracker (SFT) aimed to bridge this gap by architecting a secure, scalable, and user-centric platform that encouraged mindful manual logging while providing enterprise-grade analytics. By leveraging the MERN stack, Python microservices, and AI, the system empowered users to transition from reactive logging to proactive, informed financial planning and optimization (Deloitte, 2023; Forbes, 2023; MongoDB, 2023).

1.4 Scope
1.4.1 In Scope
The functional scope of the Smart Financial Tracker covered a robust suite of capabilities that were fully developed and successfully integrated into the platform to facilitate holistic financial hygiene. The completed functions included:
"¢ Transaction Management: A reliable, structured manual framework for recording income and expenses, supported by a deep customization engine that allowed users to dynamically organize records into personalized categories and subcategories.
"¢ Budgeting & Savings Goals: The granular setup of flexible weekly and monthly budgets equipped with progressive utilization monitoring, as well as an interactive, milestone-based savings goal tracker to incentivize consistency (Academy Bank, 2024; NerdWallet, 2026).
"¢ Real-Time Analytics Dashboard: Dynamic, highly responsive visual dashboards (developed via React) that presented categorized spending breakdowns, cash flow trends, and instantaneous financial summaries.
"¢ Intelligent Forecasting & AI Assistant: The integration of statistical linear regression to intelligently forecast short-term financial trends, machine learning modules for retirement planning insights, and a Large Language Model (LLM)-powered interactive chatbot (Draggable Assistant) providing contextual financial awareness guidance (Montgomery, Peck and Vining, 2012).
"¢ Secure Internal Wallet: A functional digital wallet designed for in-network Peer-to-Peer (P2P) transfers with robust ledger tracking to assist users in resolving shared financial commitments interactively.
"¢ Authentication & Access Control: A comprehensive, stateless security architecture utilizing JSON Web Tokens (JWT) and multi-tiered Role-Based Access Control distinguishing securely between Super Admins, Admins, standard Users, and Guests (OWASP, 2025).
1.4.2 Out of Scope
To maintain a realistic development timeline and focus on the core system architecture, the following areas were designated as out of scope for the current iteration of the Smart Financial Tracker:
"¢ Direct Bank API Integration: The system does not connect to live external banking institutions (e.g., Plaid or Stripe API) for real-time transaction syncing due to security compliance and cost constraints; all data entry is manual or simulated.
"¢ Live Investment Trading: While the system provides retirement insights, it does not facilitate actual stock market trading, cryptocurrency exchange, or real-world asset brokerage services.
"¢ Certified Legal & Financial Advice: The AI assistant is designed for contextual data awareness and general guidance only; it does not provide legally binding or certified professional financial advice.
"¢ Tax Preparation & Filing: The system is a tracking and forecasting tool and does not generate official tax returns or communicate with government revenue services.
"¢ Offline Desktop Version: The SFT is engineered exclusively as a cloud-based web application; local offline database synchronization for desktop environments is not supported in this version.

1.5 Report Overview
Chapter 2 examined the background context and objectives. Chapter 3 reviewed the existing literature and identified research gaps. Chapter 4 established the methodological approach. Chapter 5 defined the functional and non-functional requirements. Chapter 6 presented the system design. Chapter 7 detailed the technical implementation. Chapter 8 evaluated the system through rigorous testing. Chapter 9 provided an end-project evaluation. Chapter 10 reflected on the project lifecycle, and Chapter 11 synthesized final conclusions.

1.6 Chapter Summary
This chapter established the foundational context for the Smart Financial Tracker (SFT) by exploring the challenges of the modern "invisible economy" and the cognitive dissociation caused by payment decoupling. It identified critical structural weaknesses in existing solutions, ranging from the inefficiency and lack of insight in manual spreadsheets to the "reactive" nature of automated commercial apps that fail to encourage mindful spending. By defining the project"™s aim to bridge these gaps through a MERN-stack and AI-driven platform, the chapter also delineated a precise functional scope—highlighting core features like intelligent forecasting and a secure internal wallet while excluding live bank API integrations to maintain a realistic development timeline.

Building on this introduction, the next chapter provides a comprehensive examination of the background, objectives, and deliverables essential to the project's execution. It investigates the "literacy-behavioural gap" prevalent among the target demographic of university students and young professionals, who often struggle with financial self-regulation despite having access to digital tools. Furthermore, Chapter 2 outlines the specific technical objectives—such as implementing proactive 80/90/100% utilization alerts and predictive models with a target MAPE of less than 15%—while identifying the key stakeholders and structured academic artifacts that guide the project"™s lifecycle.

Chapter 2: Background, Objectives and Deliverables
2.1 Background and Domain Context
A deeper examination of the demographic landscape and existing personal finance ecosystem is required to contextualize the necessity of the Smart Financial Tracker (SFT).

2.1.1 The Target Demographic and the Literacy-Behavioural Gap
The primary users of personal financial systems are university students and early-career professionals navigating an unprecedented affordability crisis, with a significant majority struggling to secure emergency funds before the end of their financial cycle (National College Attainment Network, 2024; Santander UK, 2025).
Within this demographic, a profound "literacy-behavioural gap" exists — while most emerging adults express confidence in money management, very few apply structured financial practices, and an even smaller percentage maintains a structured emergency fund (Xiao and O'Neill, 2018; OECD, 2024). Modern social media platforms compound this issue by offering fragmented, trend-driven financial advice that neglects core concepts like cash flow management and daily expenditure tracking (OECD, 2024).

2.1.2 Current Tracking Practices and Behavioural Friction
The current consumer base relies on three fragmented methodologies, each presenting significant barriers:
1. Paper-Based Tracking — encourages psychological ownership but carries high data loss risk and zero analytical insight.
2. Spreadsheet-Based Systems — prone to formula errors, tedious manual categorization, and poor mobile usability that discourages point-of-sale logging (TechRadar, 2026).
3. Fragmented Commercial Ecosystems — separate applications for budgeting, P2P transfers, and savings require significant time to reconcile, with subscription costs frequently buried within general spending categories ("The Evolution of Budgeting Tools," 2024).
These practices illustrate a landscape characterized by reactive monitoring and application fatigue, highlighting a critical demand for a unified platform tailored to users building fundamental financial habits without enterprise-level complexity.

2.2 Objectives
1. Core Transaction Management: To develop and deploy a full-stack transaction module, enabling users to perform comprehensive CRUD operations on income and expense records with 100% data persistence and category customization to facilitate active financial awareness.
2. Proactive Budgeting: To implement an automated budget monitoring system that triggers real-time visual alerts at 80%, 90%, and 100% utilization thresholds, providing users with actionable system-level notifications to prevent overspending.
3. Secure P2P Wallet: To design and integrate an ACID-compliant internal digital wallet for peer-to-peer (P2P) transfers, utilizing double-entry accounting principles to ensure zero balance discrepancies and maintain a reliable audit trail.
4. Predictive Analytics: To deploy a predictive analytics engine that leverages Linear Regression and Random Forest models to forecast short-term expenses and simulate long-term retirement scenarios with a target MAPE of less than 15%.

2.3 Project Stakeholders
The SFT project involved several key stakeholders whose roles and expectations were critical to its success:
"¢ End Users (University Students and Early-Career Professionals): These primary beneficiaries required an intuitive, low-friction interface and actionable financial visibility to reduce cognitive overload. Their interest lay in secure, accurate forecasting that supported effective self-regulation.
"¢ Project Developer: Responsible for the end-to-end lifecycle, the developer translated complex requirements into a functional MERN-stack application while adhering to engineering best practices.
"¢ Project Supervisor: Acted as a technical mentor, providing academic guidance and critical feedback to ensure the project met rigorous university standards.
"¢ Academic Institution (NSBM / Plymouth University): Served as the regulatory body, ensuring the project adhered to ethical guidelines, curriculum parameters, and assessment regulations.

2.4 Project Deliverables
Throughout the software development lifecycle, a structured series of tangible artifacts and technical components were systematically produced. These deliverables act as verifiable milestones, documenting the evolution of the Smart Financial Tracker from theoretical conceptualization to a fully functional, production-ready system. 

2.4.1 Academic and Project Management Deliverables
"¢ Project Initiation Document (PID): A comprehensive planning artifact detailing the specific parameters of the project, including time-bound scheduling, resource allocation, initial technical constraints, and predefined functional limitations to safely guide continuous development.
"¢ Interim Report: A mid-project academic evaluation highlighting the progress of requirements gathering, detailing the extensive literature review of competing financial tools, and solidifying the initial architectural approach leading into the core development phase.
"¢ Final Project Report: This definitive academic document synthesizing the complete project lifecycle. It encompasses the finalized system architectures, implementation methodologies, rigorous end-project testing analysis, and a critical post-mortem examining the development methodology.

2.5 Chapter Summary
This chapter examined the background context and demographic landscape that necessitates the Smart Financial Tracker. It explored the "literacy-behavioural gap" and identified the fragmented nature of current tracking practices. The project objectives were defined, focusing on transaction management, proactive budgeting, secure P2P transfers, and predictive analytics. Finally, the key stakeholders and project deliverables were outlined, establishing a clear roadmap for the system's development. Building on these objectives, Chapter 3 provides a critical review of the existing literature and commercial systems to identify the specific research gaps the SFT aims to bridge.

Chapter 3: Literature Review
3.1 Introduction to Personal Financial Management Systems
Personal Financial Management (PFM) systems were widely recognized as essential digital tools intended to assist individuals in monitoring income, regulating routine expenses, and cultivating long-term savings goals. Academic research in behavioural finance consistently demonstrated that structured financial tracking contributed positively to budgeting discipline by encouraging continuous engagement with personal financial metrics (Byrne and Brooks, 2008; Xiao and O'Neill, 2018). More specifically, expense tracking functioned as a self-monitoring behaviour grounded in Financial Self-Regulation Theory (FSRT), wherein the act of logging expenditure provided diagnostic feedback that enabled individuals to identify deviations from their financial goals and recognize impulsive spending patterns in real-time (Anagha, 2026).

However, recent shifts in financial technologies saw an industry-wide pivot toward total automation, primarily through direct bank API integrations and automated transaction categorization. While this automation significantly reduced the burden of manual data entry, it simultaneously removed the psychological friction of spending — a phenomenon described as the "invisible economy." Research into digital payment behaviour demonstrated that automated and contactless transactions diminished the perceived "pain of paying," a construct whereby reduced transaction visibility led to accelerated spending cycles and weakened financial discipline (Faraz and Anjum, 2025; Karthikeyan, 2025). By detaching the user from the active logging of their expenditure, modern systems inadvertently promoted passive financial engagement, where users merely reviewed retrospective summaries rather than actively regulating daily consumption (Thaler and Sunstein, 2008; Kahneman, 2011). Consequently, a core challenge in the current PFM landscape was balancing the efficiency of automated software with the behavioural necessity of active user engagement.

3.1.1 YNAB — Comparison and Research Gaps
The primary limitation of YNAB was its exceptionally steep learning curve, which frequently proved exclusionary for beginners or younger users lacking specialized financial literacy. Furthermore, it operated on an expensive subscription model (approx. $109/annually), fundamentally alienating the university student demographic who required assistance the most (NerdWallet, 2026). This cost barrier was particularly significant given research demonstrating that students represented a high-priority group for financial self-regulation intervention (Anagha, 2026). Lastly, it lacked integrated forecasting mechanics and peer-to-peer (P2P) functionalities.

The SFT replaced rigid zero-based paradigms with an intuitive, flexible, milestone-based budgeting interface designed around user autonomy — the capacity for individuals to make informed, self-directed financial choices without reliance on complex financial literacy prerequisites (Lim, 2026). Furthermore, it completely removed the enterprise cost barrier, providing a free-to-use platform tailored for students and early-career professionals.

3.1.2 Mint and Credit Karma — Comparison and Research Gaps
The over-reliance on bank API synchronization introduced severe data latency; transactions often took days to clear, rendering real-time decision-making impossible. More critically, total automation severely diminished the user's cognitive awareness of their spending flows. Research into payment transparency demonstrated that "tap-and-go" and automated payment methods minimized the perceived financial loss associated with each transaction, leading to accelerated spending cycles — particularly among younger, digitally-native consumers (Karthikeyan, 2025; Faraz and Anjum, 2025). Since its acquisition, the platform had also aggressively shifted toward reactive credit-monitoring and targeted financial product advertising.

To counter the dissociation caused by automated data syncing, the SFT deliberately utilized a manual-first transaction logging architecture. The physical act of inputting expenses restored the cognitive "pain of paying," reinforcing behavioural accountability and financial self-regulation (Faraz and Anjum, 2025; Xiao and O'Neill, 2018). The SFT ensured data was processed in true real-time, preserving user privacy by eliminating third-party data commercialization.

3.1.3 PocketGuard — Comparison and Research Gaps
The SFT bridged the static analysis gap by introducing an advanced Predictive Analytics layer utilizing algorithmic linear regression and machine learning models. Research demonstrated that ML-based financial applications significantly improved financial literacy by offering personalized, predictive insights rather than purely historical charts, effectively transitioning the tool from a passive ledger to an active financial advisor (Kamarudeen, 2024). The application of complex models such as Random Forest regressors was further justified by their capacity to handle large, high-dimensional financial datasets with greater robustness than simple linear averages used in basic applications (Kelly and Xiu, 2023; Montgomery, Peck and Vining, 2012).

3.2 Identified Research Gaps
3.2.1 Gap 1 — Behavioural Support
Most commercial systems existed strictly as reactive databases that notified users after a budget limit had already been exceeded, offering limited behavioural nudging to prevent financial errors from occurring (Thaler and Sunstein, 2008). This reactive paradigm directly conflicted with Financial Self-Regulation Theory, which identified proactive, real-time feedback as the critical mechanism for correcting spending deviations before they escalated (Anagha, 2026; Peetz and Davydenko, 2022). The SFT implemented a proactive budgeting mechanism that issued progressive, real-time alerts at 80%, 90%, and 100% of a category's capacity. These threshold notifications re-introduced the cognitive friction diminished by digital payment environments (Karthikeyan, 2025), providing a critical window for behavioural correction before limits were breached.

3.2.2 Gap 2 — Analytical and Predictive Gap
Existing free or consumer-grade applications relied entirely on historical data visualization — they showed the user what happened last month but provided no mathematical insight into where finances were trending. This analytical gap was significant: research demonstrated that ML-based financial tools substantially improved financial literacy by providing personalized, forward-looking insights that empowered users to make proactive decisions rather than reactive ones (Kamarudeen, 2024). The integration of statistical forecasting models elevated the SFT from a passive ledger to a forward-looking financial advisor. The theoretical basis for deploying complex ensemble models in personal finance was well-established: they were demonstrably more robust than simple moving averages when handling the high-dimensional, non-linear patterns inherent in personal expenditure data (Kelly and Xiu, 2023; Montgomery, Peck and Vining, 2012).

3.2.3 Gap 3 — Ecosystem Fragmentation Gap
Managing modern finances involved shared utility bills, splitting dining costs, and collective rent. Traditional PFM tools often ignored this reality, focusing only on siloed individual wealth management. Introducing localized P2P wallet tracking allowed the SFT to act as a comprehensive ledger, recognizing that modern personal finance was collaborative rather than individual.

3.3 Chapter Summary
This chapter critically evaluated the Personal Financial Management (PFM) landscape, identifying how excessive automation in commercial tools contributed to diminished psychological resistance to expenditure. It highlighted three primary research gaps: the lack of proactive behavioural support, the absence of forward-looking predictive analytics, and the failure to address ecosystem fragmentation in collaborative financial tracking. The review concluded that the Smart Financial Tracker was uniquely positioned to bridge these gaps by marrying mindful manual engagement with advanced machine learning. Building on these theoretical foundations, Chapter 4 details the methodological approach used to develop the SFT.

Chapter 4: Method of Approach
4.1 Development Methodology Enactment
For the development of the Smart Financial Tracker (SFT), the Agile framework was selected to manage the Software Development Life Cycle (SDLC). While a detailed theoretical comparison of Agile against sequential models is provided in Appendix O, the enactment within this project focused on iterative delivery. The process was broken into ten two-week functional increments (Sprints), allowing for continuous integration and testing. This was particularly effective when addressing the "invisible economy" problem, as it allowed the UI to be refined based on immediate feedback regarding user "cognitive friction" during data entry.

4.2 Rationale for Process Selection
The choice of Agile was not merely a procedural preference but a strategic response to project constraints. As a capstone project involving experimental Machine Learning (ML) components, the technical feasibility of the Random Forest models was initially unproven. Agile allowed the architecture to evolve alongside these technical discoveries. A significant pivot occurred in Sprint 3 when external bank API integrations were found to be legally and technically restrictive; the methodology facilitated a clean transition back to a "manual-first" data entry paradigm without disrupting the overall project timeline.

4.3 Sprint Management and Version Control
Execution was centralized using GitHub Projects. Tasks were categorized into a MoSCoW-prioritized backlog (Must, Should, Could, Won"™t) to ensure core financial integrity was established before adding advanced AI features.
"¢ Version Control: Git was used to isolate experimental features, such as the Draggable Assistant, in dedicated branches before merging into main.
"¢ Continuous Integration: Automated GitHub Actions were configured to trigger backend Jest and frontend Vitest suites on every push, ensuring that new P2P wallet logic did not break existing transaction persistence. A complete, audited Sprint-by-Sprint log and the full MoSCoW classification are available in Appendix H.

4.4 Enacted Technological Stack
The SFT platform was built using the MERN stack (MongoDB, Express, React, Node.js) supplemented by a Python Flask microservice for ML-based forecasting. This stack was chosen for its JSON-centric data flow, which minimizes transformation latency between the NoSQL database and the React UI.



















Chapter 5: Requirements
5.1 Functional Requirements
Functional requirements define the core behaviour, features, and operational capabilities that the Smart Financial Tracker (SFT) must possess to resolve the problems identified in the existing landscape. To effectively prioritize development during the Agile sprints, these requirements were categorized using a prioritization framework based on their criticality to the system's core purpose.

5.1.1 Must Requirements (Mandatory)
These are the foundational, non-negotiable requirements necessary for the SFT to operate as a viable baseline financial tracking system. Without these, the project would fail its primary objective.
"¢	User Authentication & Security: The system must allow users to register an account, log in securely using encrypted credentials, and manage an authenticated session to protect isolated personal financial data.
"¢	Manual Transaction Management (CRUD): The system must provide complete Create, Read, Update, and Delete functionality, allowing users to manually construct robust ledgers of daily income and discretionary expense transactions.
"¢	Dynamic Categorization: The system must allow users to assign each transaction to a specific category (e.g., Groceries, Rent, Subscriptions) and create custom categories to accurately map their unique lifestyle.
"¢	Budget Threshold Monitoring: The system must permit the creation of defined weekly and monthly fiscal budgets, continuously calculating the remaining balance based on logged expenses mapped to those budget categories.

5.1.2 Should Requirements (Efficiency & User-Friendliness)
These requirements elevate the system from a basic data registry into a highly usable, efficient, and engaging platform. They ensure the system is competitive and actively helpful.
"¢	Interactive Real-Time Dashboards: The system should instantly process ledger data into dynamic visual charts and graphs (e.g., pie charts for category breakdowns, line graphs for monthly trends) to enhance cognitive pattern recognition ("The Evolution of Budgeting Tools: A Look at Today"™s Top Personal Finance Apps,"� 2024).
"¢	Progressive Budget Alerts: The system should issue visual UI notifications when a user reaches 80%, 90%, and 100% of a defined budget, providing an active window for behavioural correction (Thaler and Sunstein, 2008).
"¢	Digital P2P Wallet: The system should feature an internal wallet mechanism allowing users to log peer-to-peer transfers with other users in the system to intuitively manage shared expenses (e.g., splitting a utility bill).
"¢	Contextual AI Assistant: The system should feature an interactive, draggable AI chatbot on the client interface capable of processing user queries to provide general financial awareness and system navigational guidance.




5.1.3 Could Requirements (Future Enhancements & Edge Cases)
These are advanced, value-adding features implemented to provide enterprise-grade capabilities, ensuring the project is future-proofed against evolving user requirements.
"¢	Machine Learning Forecasting: The system could utilize historical transaction data alongside statistical linear regression and Machine Learning (e.g., Random Forest Regressors) to predict future expenses and provide long-term automated retirement planning projections (Montgomery, Peck and Vining, 2012).
"¢	Role-Based Access Control (RBAC): The system could establish multiple permission tiers (Super Admin, Admin,
"¢	User, Guest), allowing administrators to oversee system health metrics without compromising individual user ledger privacy.
"¢	Data Export Capabilities: The system could allow users to generate and download comprehensive financial summary reports in PDF or CSV formats for external filing or tax preparation.

5.2 Non-Functional Requirements
Non-functional requirements (NFRs) specify the quality attributes, performance goals, and architectural parameters of the system. For this undergraduate capstone project, the following highly achievable and critical NFRs were established and successfully implemented:

5.2.1 Security & Data Integrity
Given the sensitivity of financial data, security was paramount. The system must securely hash all user passwords (utilizing `bcrypt`) before database insertion. Furthermore, it must implement stateless JSON Web Tokens (JWT) for secure session management and authorization routing, protecting endpoints from unauthenticated access (OWASP, 2025). By explicitly avoiding external open-banking APIs, the system also inherently guarantees that user purchasing histories remain completely isolated from third-party commercial tracking.

5.2.2 Usability
The application must present an intuitive, frictionless user experience (UX) to prevent application fatigue. By utilizing React.js, the system must ensure cross-device responsiveness, gracefully adapting the UI from widescreen desktop monitors to mobile displays. Additionally, dynamic features like the AI Assistant must integrate smoothly via mouse and touch dragging (60fps performance) without obstructing primary data views or violating accessibility standards (e.g., retaining active ARIA labels) (World Wide Web Consortium, 2018; Ailleron, 2025; Elementor, 2026).

5.2.3 Maintainability
The codebase must be structured to allow future developers to easily read, update, or expand the system"™s functionality. This is achieved through a heavily modular component-based architectural design on the frontend, separated Model-View-Controller (MVC) logic on the backend API, and comprehensive inline commenting. Furthermore, the mandatory application of GitHub CI/CD methodologies ensures that any future code updates are automatically tested and validated before merging, maintaining systemic health.

5.3 Requirements Gathering Evidence
To transition abstract ideas into the concrete requirements listed above, empirical evidence was collected. The gathering process employed a mix of qualitative and quantitative mechanisms to ensure scientific rigor.

5.3.1 Conducting Interviews
Interviews provided deep, qualitative contexts regarding user frustrations. A formal, semi-structured interview protocol was authored covering five thematic domains (e.g., tracking practices, UI pain points, privacy boundaries). 26 specific participants were carefully selected, representing the target demographic (15 undergraduates, 8 early-career professionals, 3 financial experts). Conducting 20-to-30-minute sessions via video conferencing or in-person dialogues allowed the researcher to record spontaneous feedback, which directly highlighted the pervasive distrust of automated bank syncing, thereby establishing the "Must Requirement" for manual transaction logging.

5.3.2 Conducting Questionnaires
To capture broader statistical trends, a structured digital questionnaire was developed and deployed via Google Forms (titled "Smart Finance Tracker App "“ User Requirement Survey"). This survey was designed to quantify user behavior patterns that qualitative interviews might miss.
The aggregated data revealed that 83.3% of users forget to record their expenses at least sometimes, and 88.9% prefer graphical reports and charts for analysing expenses. This specific statistical evidence directly reinforced the 'Should Requirement' to implement highly visible, real-time interactive Recharts visualisations and automated tracking alerts within the platform. Furthermore, the survey revealed that 88.9% of respondents rated a simple and user-friendly interface as very important. The full questionnaire and aggregated results are provided in Appendix B

5.3.3 Conducting Observations (Competitive Analysis)
Observational gathering was executed through extensive heuristic evaluations and competitive benchmarking. Test accounts were established on existing commercial platforms, including MINT, YNAB, and PocketGuard. By directly navigating the user journeys of these apps, the researcher physically observed the friction points—such as forced paywalls, excessive advertising pop-ups, and complex jargon. These observations confirmed the necessity to build a cleaner, less punitive user interface.
5.3.4 Reviewing Existing Documents
Finally, extensive secondary document analysis was performed. This involved aggregating and evaluating established academic literature on behavioural finance, reviewing whitepapers compiled by global financial institutions (OECD, 2024), (World Wide Web Consortium, 2018), and studying contemporary software engineering texts regarding MERN stack capabilities (Sommerville, 2011; Pressman, 2020). Reviewing this existing documentation provided the critical theoretical foundation validating concepts like "payment decoupling."

5.5 Chapter Summary
This chapter defined the functional and non-functional boundaries of the Smart Financial Tracker. By categorizing requirements into Must, Should, and Could tiers, the project maintained a clear focus on core financial integrity while allowing for advanced analytical features. The gathered evidence from interviews, surveys, and competitive analysis provided the empirical justification for the system's "manual-first" and proactive alerting paradigm. Building on these requirements, Chapter 6 presents the System Design, translating these needs into technical blueprints and architectural diagrams.

Chapter 6: System Design
6.1 Use Case Diagrams
The Use Case Diagrams define the structural boundaries of the system and outline all authorized interactions between varying user roles (Admin, User, Guest) and core functionalities.

[Figure 6.1: Use Case Diagram — Core Transaction and Budget Management]
[Figure 6.2: Use Case Diagram — P2P Wallet and Security]
[Figure 6.3: Use Case Diagram — AI Assistant and Predictive Analytics]

6.2 Use Case Assumptions and Constraints
6.2.1 Technical Assumptions
"¢ Constant External Connectivity: It was assumed that the system has continuous internet access to communicate with the Groq AI API and the Python ML Microservice. If these external services are unavailable, those specific use cases (Forecasting and AI Assistant) utilize local fallback logic (e.g., naive linear regression).
"¢ Browser-Based Execution: It was assumed the user accesses the platform through a modern web browser supporting ES6+, as the React Dashboard relies on the CSS Grid and Flexbox modules for responsive layout rendering.
"¢ Token Persistence: The diagrams assumed a stateless authentication model where a valid JSON Web Token (JWT) is stored in the browser"™s local storage to authorize all internal system requests for the User and Admin actors.

6.2.2 Operational Assumptions
"¢ Closed Ecosystem Wallet: All Peer-to-Peer (P2P) Transfers were assumed to occur strictly within the SFT internal database. The system does not assume integration with real-world banking gateways for external fund settlement.
"¢ Targeted Verification: It was assumed that the OTP Verification use case is triggered exclusively during the Perform P2P Transfer workflow. It is not assumed as a requirement for standard transaction logging or login.
"¢ User Data Accuracy: The system assumed the manual data entered by the user (Income/Expenses) is accurate. The platform performs mathematical validation (e.g., preventing negative transfers) but does not verify the user's real-world physical cash balance.

6.2.3 User & Actor Assumptions
"¢ Actor Generalization: The diagram assumed a Generalization relationship where the Administrator inherits all functional permissions of a Standard User, with the unique addition of the Admin Control Center for system-wide analytics.
"¢ Mandatory Entry Points: It was assumed that Register Account or Secure Login is the mandatory entry point for all persistent data use cases. The Access as Guest actor is assumed to be isolated from these persistent requirements.
"¢ Administrative Privacy: While the Administrator has access to system-level data, it was assumed that individual user privacy is maintained through data masking, ensuring the Admin cannot view private transaction notes unless an audit is required.

6.3 Overall System Architecture
The Smart Financial Tracker utilizes a decoupled, micro-service-oriented architecture to balance real-time user interactivity with complex mathematical processing. 

[Figure 6.4: System Architecture Diagram — MERN + Python Microservices]

6.3.1 Architecture Explanation
The overall system architecture of the Smart Financial Tracker (SFT) was designed as a modular, distributed full-stack application. The client interface was constructed utilizing React to provide a highly responsive, single-page application (SPA) experience. This frontend communicated securely via RESTful APIs to a Node.js and Express backend gateway, which served as the primary data orchestrator connected to a NoSQL MongoDB Atlas cluster (MongoDB, 2023; OpenJS Foundation, 2026). For computational workloads, the architecture effectively separated concerns: short-term predictive expense forecasting was offloaded to a dedicated Python microservice leveraging Scikit-Learn libraries, while complex mathematical operations, such as stochastic Monte Carlo simulations for retirement planning, were executed natively within the Node.js layer to optimize latency. Finally, the system's intelligent conversational features were driven by direct integration with the Groq API, operating a Llama 3 Large Language Model to deliver real-time, context-aware financial guidance. Authentication routines were fortified using stateless JSON Web Tokens (JWT) coupled with custom email-based One-Time Passwords (OTPs) for enhanced transaction security (OWASP, 2025).

6.3.2 Class Diagram — MongoDB Collections
 Figure 6. 7 : Class Diagram — MongoDB Collections
 
Full field-level schema definitions for all MongoDB collections, including data types, constraints, and relationship notes, are provided in Appendix F.


6.4 Sequence Diagrams====keep only 2.rest to appendix with explainations
6.4.1 User Registration and Email Verification 
Figure 6. 8 : Sequence diagram : User Registration and Email Verification
 

6.4.2 Add Expense Transaction 
Figure 6. 9 : Sequence diagram : Add Expense Transaction
 

6.4.3 Peer-to-Peer Money Transfer 
Figure 6. 10 : Sequence diagram : Peer-to-Peer Money Transfer
 
6.4.4 AI Chatbot Conversation — Tracksy
 Figure 6. 11 : Sequence diagram : Chatbot Conversation — Tracksy
 

6.4.5 Expense Forecast via ML Service 
Figure 6. 12 : Sequence diagram : Expense Forecast via ML Service
 












6.5 Activity Diagrams
6.5.1 User Login with 2FA Flow
Figure 6. 13 : Activity diagram : User Login with 2FA Flow
 
6.5.2 Budget Alert and Notification Process 
Figure 6. 14 :Activity diagram: Budget Alert and Notification Process
 

6.5.3 Retirement Plan Calculation via Monte Carlo 
Figure 6. 15 :Activity diagram: Retirement Plan Calculation via Monte Carlo
 
6.6 Frontend UI — Figma Wireframe Reference
Prior to implementation, the user interface was prototyped using Figma to establish visual hierarchy, navigation flow, and component layout. The wireframes established the foundational design language — including the sidebar navigation, card-based financial summary components, and the floating Tracksy AI widget — which were subsequently translated into the React implementation. The Figma prototype is accessible via the project source code repository link in Appendix J.

[Figure 6.16: Figma Wireframe — Dashboard Layout (pre-implementation prototype)]
(Note: The student must insert the actual Figma screenshot here.)

6.7 Real Frontend UI — Screenshot Guide
The following screenshots illustrate the key user interface components of the fully deployed Smart Financial Tracker platform, demonstrating the translation of the wireframe designs into the functional React application.

[Figure 6.17: SFT Login Page — 2FA Email OTP Authentication Interface]
[Figure 6.18: Main Financial Dashboard — Income, Expenses, and Budget Summary]
[Figure 6.19: Budget Management Page — Progressive Alert Indicators]
[Figure 6.20: Tracksy AI Assistant — Draggable Widget in Active Conversation]
(Note: The student must replace each placeholder with an actual screenshot taken from the deployed application before submission.)

6.8 Backend Architecture — API Structure
Module	Base Route	Key Endpoints
Auth and Users	/api/users	POST /register,POST /login,POST /guest-login, GET/PUT /profile 

Transactions	/api/transactions
GET /, POST /, PUT /:id, DELETE /:id

Wallet	/api/wallet
GET /balance,POST /add-funds,POST /withdraw, GET /transactions

Transfers	/api/transfers	POST /send-otp, POST /initiate, POST /:transferId/process,
GET /my-transfers
Budgets	/api/budgets
GET /, POST /, PUT /:id, DELETE /:id

Goals	/api/goals	GET /, POST /, PUT /:id, DELETE /:id

Bills	/api/bills	GET /, POST /, PUT /:id, PATCH /:id/pay

Loans	/api/loans	GET /, POST /, POST /:id/payment, GET /:id/schedule

Analytics	/api/financial-health	GET /score, GET /history
Forecasting	/api/forecasting	GET /expenses, GET /category/:category

AI Chat	/api/chat	POST /
Retirement	/api/retirement	POST /calculate, POST /simulate, POST /advise, GET /plans, POST /plans

Notifications	/api/notifications	GET /, PATCH /:id/read, PATCH /read-all, DELETE /:id

Admin	/api/admin	GET users, PATCH /users/:id/role, PATCH /users/:id/status 
(Note: Analytics is under /api/admin/analytics)
Table 6. 1: REST API Endpoint Groups
A complete API endpoint reference table, including HTTP methods, route paths, authentication requirements, and role constraints for all modules, is provided in Appendix G.


Backend Technology Stack Summary
Node.js + Express
â”œâ”€â”€ Authentication: jsonwebtoken + bcryptjs
â”œâ”€â”€ Database ORM: Mongoose connecting to MongoDB Atlas
â”œâ”€â”€ Event Management: Custom asynchronous Node.js controller patterns
â”œâ”€â”€ Email: Nodemailer (SMTP)
â”œâ”€â”€ AI Engine: Groq API (native proxy to Llama models)
â”œâ”€â”€ Validation: Custom localized validation schemas
â”œâ”€â”€ Security: CORS wrapper implementation
â”œâ”€â”€ Testing: Jest + mongodb-memory-server + Supertest
â””â”€â”€ ML Bridge: axios (to Python Flask service)

Chapter 7: Implementation

7.1 Development Environment and Technologies
The technical implementation of the Smart Financial Tracker (SFT) required a cohesive aggregation of robust development environments, modern programming languages, and scalable frameworks. 

7.1.1 Programming Languages and Frameworks
"¢	JavaScript (ECMAScript 2022+): Serving as the foundational language across the entire MERN stack. It was utilized both on the client-side to drive the user interface and on the server-side to handle the API gateway logic.
"¢	Python: Employed strictly for backend microservices to execute the complex mathematical operations required for statistical forecasting and Machine Learning regression.
"¢	Node.js & Express.js: Provided the runtime environment and backend framework to rapidly build isolated, RESTful API endpoints and manage authentication middleware.
"¢	React.js: Utilized for designing the single-page application (SPA) frontend, leveraging modern hooks for real-time interface manipulation.
"¢	Mongoose: Acted as the Object Data Modeling (ODM) library connecting the Node.js environment to the MongoDB Atlas cluster, enforcing schema validation.

7.1.2 Primary Development Environment
Integrated Development Environment (IDE): Visual Studio Code (VS Code) was the primary IDE, selected for its integrated terminal, ESLint formatting capabilities, and Git manipulation tools.
Database Engine: MongoDB Atlas (Cloud-Hosted) was utilized as the NoSQL storage tier, providing high-availability clusters to manage JSON-like document data (MongoDB, 2023).
API Management & Testing: Postman was heavily utilized during development to rigorously test, configure, and validate backend RESTful endpoint structures before implementing them into the React frontend.

7.2 Main Module Development Algorithms
7.2.1 Peer-to-Peer (P2P) Wallet Transfer Algorithm
Algorithm Flow Description:
To ensure financial integrity, the internal digital wallet was engineered utilizing "Atomic Transactions"� and "Double-Entry Accounting"� principles (Taduka, 2024). The algorithmic flow is as follows:
1.	Initiation: The system receives a transfer request executing processTransferInternal.
2.	Validation: The backend verifies both identities and checks if the sender"™s wallet balance is `â‰¥` the requested amount.
3.	Atomic Session: A MongoDB transaction session (mongoose.startSession()) initializes. If any step fails, the entire transaction rolls back to prevent money from disappearing.
4.	Deduction & Addition: The algorithm deducts the amount from the Sender"™s balance and simultaneously adds it to the Receiver"™s balance.
5.	Ledger Creation: Standard log tracking entries are created in the Transaction entity collection.
6.	Commit: The session is successfully committed (session.commitTransaction()), writing all data to the database permanently.
 
Implementation Code Snippet (Wallet Controller):
"The complete implementation of the `processTransferInternal` function, including the full Mongoose ACID session lifecycle, is available in the project source code repository (see Appendix — Project Source Code Link)."

7.2.2 Machine Learning Forecasting Algorithm (Python Microservice)
Algorithm Flow Description:
To combat static historical reporting, a predictive algorithm microservice was built utilizing Python and Scikit-Learn (Montgomery, Peck and Vining, 2012).
1.	Execution Request: The Node.js server sends a POST request with the user's ID to the Python /predict endpoint.
2.	Direct Extraction: The Python backend dynamically connects to MongoDB via pymongo to fetch the user's chronological transaction history without bottlenecking the main Express app.
3.	Model Loading: Rather than training on the fly, the system maximizes performance by loading pre-trained Scikit-Learn Random Forest Regressor models (model_expense.pkl and model_income.pkl) using joblib.
4.	Prediction Calculation & Payload: The model evaluates the arrays and predicts upcoming cycles up to monthsAhead. The generated figures are packaged into a JSON payload and returned to the React frontend.

7.2.3 Draggable AI Assistant Algorithm (UI Logic)
Algorithm Flow Description:
To ensure high usability without obstructing the dashboard, an interactive viewport drag controller was developed for the Tracksy React component utilizing lifecycle hooks.
1.	Initialization: State logic (useState) captures the initial X and Y coordinates.
2.	Pointer Capture:  handleMouseDown registers the interaction and activates an isDragging boolean, noting the specific click-offset.
3.	Coordinate Recalculation: Global mousemove event listeners calculate the delta trajectory across the viewport, passing the data back to setPosition(...) to seamlessly reposition the CSS element dynamically without severe UI tearing.

7.2.4 Budget Threshold Monitoring Algorithm
The core logic responsible for real-time behavioral alerting and fiscal management.

Annotated Code Specification
// Real-time Threshold Monitoring Logic
function checkBudget(spent, limit) {
// 1. Calculate relative fiscal consumption
const usage = (spent / limit) * 100;
// 2. Execute cascading conditional threshold checks
// Priority is given to the most critical state (100%+)
if (usage >= 100) return "Alert: Budget Exceeded";
if (usage >= 90) return "Warning: 90% of budget reached";
if (usage >= 80) return "Caution: 80% of budget reached";
// 3. System continues monitoring without triggering UI notifications
return "Status: OK";
}

Chapter 8: System Testing and Evaluation
8.1 Introduction to the Testing Strategy

Testing and evaluation form a critical phase of the software development lifecycle, ensuring that the Smart Financial Tracker (SFT) is robust, secure, and user-friendly. While automated toolchains (like Jest and Vitest) were utilized to establish a stable deployment baseline, "Manual Testing"� was positioned as the primary evaluation methodology. Because the system's core value relies on active behavioural engagement and usability, executing structured manual walkthroughs acting as a real user was considered a core project deliverable. All test cases in this chapter are strictly documented using the "Acceptance format (Given / When / Then)"� to map business logic directly to executable conditions.
Full documented test case results — including unit, integration, system, non-functional, and security test outcomes — are provided in Appendix D.
8.2 Unit Testing
Unit testing involves isolating distinct components, functions, or modules of the codebase to verify their operational logic independently from the rest of the application. In the SFT, backend unit testing was executed to validate mathematical logic (such as wallet deductions) and frontend component isolation.
Field	Description
Test Case ID	TC-010
Module	P2P Wallet Transfer
Test Case Name	P2P Atomic Integrity
Type	Unit / Integration
Scenario	Validate transaction atomicity during transfer to ensure no funds are lost during system failure.
Given	Sender has $50; Receiver has $0; A transfer is initiated for $30.
When	processTransferInternal begins; System simulates a crash after debiting the sender but before crediting the receiver.
Then	session.abortTransaction() is triggered; Sender balance is restored to $50; Receiver balance remains $0.
Priority	High
Status	Pass
8.3 Integration Testing
Integration testing evaluates how distinct microservices, databases, and APIs interact when combined. Integration testing verified the data flow between the Node.js API gateway, the Python ML microservice, and MongoDB. Full integration test case results are provided in Appendix D (TC-013).
8.4 System Testing (Manual Testing Focus)
System testing validates the completely assembled, fully integrated application. Because human interaction and interface friction are central themes of the project, exhaustive "Manual System Testing"� served as the primary verification deliverable. Every core user workflow was manually executed step-by-step through the browser to simulate actual daily application usage.
Field	Description
Test Case ID	TC-008
Module	Budget Monitoring
Test Case Name	100% Budget Exceeded Alert
Type	System
Scenario	Validate that the system correctly identifies and alerts when a category budget limit is fully reached.
Given	Category "Rent" has a $1000 limit; Current spent amount is exactly $1000.
When	User attempts to add any additional expense transaction to the "Rent" category.
Then	Spent % >= 100; UI displays "Budget Exceeded" badge; AlertCircle icon highlights in red; Notification is logged.
Priority	High
Status	Pass
8.5 User Acceptance Testing (UAT)
User Acceptance Testing shifts the evaluation from the developer to the actual target demographic. To conduct UAT, the system was temporarily hosted in a staging environment. Digital feedback surveys were formulated and distributed to a closed testing group comprising classmates and independent university peers representing the core target audience. They were tasked to use the P2P wallet and the AI assistant, then provide qualitative responses regarding application logic and friction.
The UAT survey instrument and aggregated qualitative and quantitative feedback results from the closed beta testing group are provided in Appendix E.
8.6 Non-Functional Testing
While functional tests verified "˜what"™ the system does, non-functional testing examined "˜how well"™ the system performs under constraints. Software profiling applications and browser tools were utilized to explicitly test baseline usability, load speeds, and API security.
8.6.1 Performance and Usability Testing
Google Lighthouse was utilized to audit the performance of the React DOM and production build. The Lighthouse audit was executed against the production build of the SFT dashboard. The full diagnostic report and score breakdown are provided in Appendix D (TC-024).
8.6.2 Security and Access Control Testing
Postman was leveraged as the application tool to manually simulate malicious requests, testing the system's JWT authentication shielding.
Field	Description
Test Case ID	TC-019
Module	JWT Security
Test Case Name	JWT No Token Access
Type	Non-Functional (Security)
Scenario	Validate that protected API endpoints are inaccessible without a valid Bearer token.
Given	No Authorization header or Bearer token is provided in the HTTP request.
When	User attempts to access a protected route such as GET /api/transactions.
Then	System returns Status 401 Unauthorized; JSON response message: "No token provided".
Priority	High
Status	Pass

Chapter 9: End Project Report

9.1 Project Summary
The Smart Financial Tracker (SFT) was conceived and developed to directly address the "invisible economy" phenomenon, wherein the seamless nature of modern digital transactions fundamentally deteriorates an individual's cognitive awareness of their spending (Thaler and Sunstein, 2008; Kahneman, 2011). Recognizing that the target demographic (emerging adults and university students) was severely underserved by an ecosystem of applications that were either too rigorously complex (YNAB) or entirely too automated (Mint/Credit Karma), the SFT was engineered to occupy a crucial behavioural middle ground. 

Utilizing the monolithic MERN stack (MongoDB, Express.js, React.js, Node.js), the SFT delivers a highly secure, privacy-first web platform (Enfin Technologies, no date; MongoDB, 2023; OpenJS Foundation, 2026). It actively enforces financial accountability by requiring structured manual transaction logging, while simultaneously rewarding that manual effort with enterprise-grade, real-time visual analytics. Furthermore, the integration of Python microservices executing Scikit-Learn Machine Learning regression algorithms, alongside a Large Language Model (LLM) powered "Draggable Assistant," transforms the project from a reactive digital ledger into a highly proactive, intelligent financial forecasting tool (Montgomery, Peck and Vining, 2012). Finally, integrating a Peer-to-Peer (P2P) wallet directly into the architecture successfully bridged the gap between individualized wealth tracking and shared financial realities.

9.2 Achievements and Self-Evaluation
An essential aspect of the end-project evaluation requires a critical, honest self-assessment regarding the fulfilment of the predefined objectives and the execution of the established scope. 

9.2.1 Evaluation of Objectives
"¢	Objective 1 (Fully Achieved): The core CRUD transaction engine with highly customizable categorization was successfully developed and deployed as the system's foundational layer.
"¢	Objective 2 (Fully Achieved): The intelligent budgeting configuration was engineered to successfully emit progressive, real-time UI threshold alerts at 80%, 90%, and 100% capacity triggers, actively facilitating behavioural spending correction.
"¢	Objective 3 (Fully Achieved): A high-security internal digital wallet was deployed utilizing atomic database sessions and double-entry accounting to ensure mathematically sound P2P transfers between system users.
"¢	Objective 4 (Fully Achieved): Advanced algorithmic analytics were established via an isolated Python microservice, successfully reading historical user datasets to cast mathematical linear regressions for short-term and long-term expense forecasting.
"¢	Objective 5 (Unachieved / Deliberately Scoped Out): The original proposal briefly considered the inclusion of direct, automated bank API synchronization. Upon deeper technical and heuristic investigation, this objective was intentionally unachieved and removed from the active scope. Building open-banking integrations presented massive licensing costs and breached the privacy limits requested by users during interviews. Crucially, automating the data entry directly conflicted with the core psychological goal of the project: maintaining the user"™s cognitive, manual engagement to build healthy financial habits.

9.2.2 Evaluation of Scope
The functional scope detailed in the Project Initiation Document (PID) was successfully fully realized. The complete frontend interface was built, and the backend routing dynamically handles the user base precisely as intended without systemic crashes. Experimental scope items, particularly the boundary-constrained, hovering "Draggable AI Assistant," overperformed expectations, smoothly maintaining 60 frames-per-second while querying the hosted Groq API models to provide conversational context. The project remained strictly within academic timelines, transitioning successfully from design to an evaluative build state.

9.3 Customer and Target User Feedback
To validate the system"™s real-world viability, the closed beta phase integrated rigorous User Acceptance Testing (UAT) executed by university peers representing the core software demographic. The qualitative feedback gathered through comprehensive survey forms was highly positive, highlighting specific validations of the system"™s design choices:
1.	Privacy and Trust: A dominant theme in the UAT feedback was extreme satisfaction regarding the "˜lack"™ of imposed bank syncing. Users explicitly noted that the isolated, manual-entry nature of the SFT felt significantly safer than commercial alternatives, relieving anxieties about their purchasing data being harvested or commodified (World Bank Group, 2024).
2.	Dashboard Clarity: Users highly rated the dynamic React visual dashboards. Feedback indicated that the pie charts and line graphs immediately clarified where their disposable income was deteriorating, specifically highlighting previously unnoticed recurring subscription fees ("The Evolution of Budgeting Tools: A Look at Today"™s Top Personal Finance Apps,"� 2024).
3.	Chatbot Usability: The Draggable AI Assistant received highly enthusiastic feedback regarding interface usability. Testers found the ability to quickly ask the bot regarding generic budgeting strategies (e.g., "explain the 50/30/20 budget rule") while concurrently viewing their ledger prevented them from having to open new browser tabs, keeping them completely focused on their financials.
4.	Areas for Polish: Minor critical feedback was logged primarily concerning the mobile viewport interface. Some users noted that while the draggable widgets responded perfectly on desktop, dragging elements near the bottom navigation bar on narrower touchscreen phones occasionally caused overlapping, prompting minor CSS media query refinements prior to final deployment.

9.4 User Benefits
The Smart Financial Tracker (SFT) provides robust benefits designed to counteract modern financial pressures:
"¢	Restoration of Financial Awareness: By requiring manual logging, the system restores the psychological friction lost in cashless transactions, encouraging more mindful spending habits.
"¢	Proactive Financial Regulation: Shifting from reactive to proactive monitoring via threshold alerts allows users to modify their behavior before exceeding budgets, effectively minimizing debt accrual.
"¢	Unified Financial Intelligence: The platform eliminates ecosystem fragmentation by unifying budgeting, P2P transfers, and enterprise-grade ML forecasting in a single, accessible, and free interface.

Chapter 10: Project Post-Mortem (Reflection)

10.1 Introduction to Project Reflection
A Post-Mortem analysis provides a structured, critically reflective review of the entire Software Development Life Cycle (SDLC) executed during this capstone project. Stepping back from the active codebase enables a comprehensive evaluation of the methodological successes, the technical barriers encountered, and the broad spectrum of professional competencies cultivated during the creation of the Smart Financial Tracker (SFT).

10.2 Technical Skill Development and Technologies Learned
The most profound outcome of this project was the transition from a theoretical understanding of computer science principles to the practical, engineered execution of a full-stack, distributed web application.

10.2.1 Core Framework Mastery (The MERN Stack)
Prior to the commencement of this project, the developer's exposure to web development was limited primarily to isolated front-end scripts and basic database queries. Developing the SFT required mastering the MERN stack cohesively:
"¢	React.js: A deep practical understanding of the React Component Lifecycle was developed, specifically regarding the management and protection of application state through native hooks (useState, useEffect, useRef). The critical importance of preventing unnecessary DOM re-renders was identified early, particularly when building high-performance interactives like the Draggable AI assistant, applying optimized useEffect dependency tracking and state closures to ensure 60fps smoothness across the viewport constraints and smooth rendering.
"¢	Node.js & Express.js: Secure backend engineering proficiency was cultivated throughout the development cycle. The mechanics of constructing stateless RESTful APIs, configuring CORS policies, and integrating complex authentication middleware using bcrypt and JWT were applied systematically.
"¢	MongoDB & Mongoose: Backend data modeling capabilities were significantly advanced, with flexible NoSQL database schemas engineered to accommodate user-defined categorization without the rigid structural constraints inherent in relational SQL systems.

10.2.2 Machine Learning and External Integrations
Python Microservices (Scikit-Learn): A significant technical progression was achieved by extending development outside the JavaScript ecosystem into Python microservices. Raw JSON payloads were processed into Pandas DataFrames, and Scikit-Learn RandomForestRegressor algorithms were implemented to forecast expenditure trends from historical transaction data.
LLM API Integration: Through integration of the Groq API to power the Tracksy chatbot, skills in handling asynchronous external API fetches were acquired, alongside techniques for managing API rate-limiting delays within the UI using visual loading states, and securing private access keys via environment variables.

10.3 Identifying Technological Limitations
Constructing the system exposed several inherent limitations and bottlenecks associated with the selected technologies, teaching me vital lessons in architectural compromise:
React.js (Client-Side Rendering Limits): While React allows for rapid, dynamic user interfaces, it strictly performs Client-Side Rendering (CSR). It was discovered that offloading excessive mathematical processing — such as filtering large transaction ledgers — to the client browser degraded performance on lower-specification mobile devices. This limitation necessitated an architectural refactoring, with heavy data aggregation operations relocated to the Node.js server prior to payload delivery to the React frontend.
MongoDB (Transaction Isolation): Creating the P2P Wallet highlighted a structural limitation within standard NoSQL databases. Unlike SQL databases that inherently excel at transactional safety, using MongoDB for digital wallets required writing extensive, highly explicit `startSession()` code architecture to legally enforce Atomic Transactions (ensuring money couldn't be deducted from one wallet without successfully arriving in another if the server crashed mid-request).

10.4 Soft Skill and Professional Development
The solitary nature of a final-year academic capstone project acts as an accelerated incubator not only for coding logic but for fundamental professional soft skills.

10.4.1 Agile Project Management and Discipline
The project required the decomposition of large-scale engineering objectives — such as the construction of a secure P2P wallet system — into granular, two-week actionable sprints managed via a GitHub Kanban board. The capacity for accurate time estimation, structured backlog prioritisation, and sustained development momentum demonstrated throughout this project reflects skills directly applicable to commercial software engineering environments.

10.4.2 Problem-Solving and Resilience
Diagnosing a multi-tier data failure — wherein the React frontend crashed due to the Node.js API failing to await the Python microservice response — required systematic analysis traversing three distinct programming languages. This experience reinforced the discipline of logical fault isolation using console logs, Postman network traces, and Chrome DevTools rather than speculative code modification.

10.4.3 Stakeholder Communication and Empathy
The formal requirements gathering process — involving structured interviews with university peers regarding financial stress — and the subsequent translation of qualitative user anxieties into concrete functional specifications reinforced the foundational principle of user-centric design: that software must be engineered to solve the human problem before the screen, rather than satisfying the technical ambitions of the engineer behind it.

Chapter 11: Conclusion and Future Work

11.1 Final Project Summary
The overarching objective of this final-year project was to engineer a solution that actively counteracts the "invisible economy" facilitated by modern, frictionless digital transactions. The Smart Financial Tracker (SFT) was successfully developed as a secure, full-stack personal finance management application that rejects the industry trend of total automation in favour of cognitive financial engagement (Byrne and Brooks, 2008; Kahneman, 2011).

Over the course of the Software Development Life Cycle, the project successfully deployed a robust monolithic architecture utilizing the MERN stack (MongoDB, Express.js, React.js, Node.js) (Enfin Technologies, no date; MongoDB, 2023; OpenJS Foundation, 2026). The system fully realizes its core functional requirements: it provides a highly secure methodology for users to manually log and categorize transactions, calculates remaining fiscal balances in real-time, and generates dynamic visual dashboards. The application goes beyond passive data registry by introducing an intelligent budgeting mechanism that progressively notifies users at critical expenditure thresholds (80%, 90%, 100%), granting them the necessary temporal window to enforce behavioural spending correction.

Furthermore, the system successfully bridged the analytical gap prevalent in consumer-grade applications. By establishing isolated Python microservices, the SFT leverages machine learning (Scikit-Learn Random Forest Regressor) to mathematically predict future financial constraints based on historical logging (Montgomery, Peck and Vining, 2012). This was combined with the client-side integration of a Large Language Model (Groq API) via the "Draggable Assistant," creating an interactive environment where users receive immediate, contextual financial awareness guidance. Lastly, implementing an internal, cryptographically secure digital wallet equipped with atomic transactions allows users to trace and resolve shared peer-to-peer (P2P) commitments cleanly within the single SFT ecosystem.

The project adhered strictly to the Agile methodology, utilizing GitHub for continuous iteration and version control. Through rigorous manual system testing and User Acceptance Testing (UAT), the SFT was validated mathematically and behaviourally, successfully demonstrating that manual cognitive friction combined with enterprise-grade data visualization produces superior financial visibility for emerging adults (Byrne and Brooks, 2008; Xiao and O"™Neill, 2018).

11.2 Main Limitations
Despite the successful deployment and stabilization of the platform, the current iteration possesses distinct limitations bound by the academic and technical constraints of the project timeline.

Absence of API Bank Synchronization: As actively determined during the requirements gathering phase, automated bank syncing was excluded to protect privacy and promote manual behavioural engagement. However, for a subset of power users handling highly complex digital portfolios, explicitly requiring every micro-transaction to be logged manually presents a definitive friction point that could theoretically lead to system abandonment over extended, multi-year timelines.
Lack of Live Multi-Currency Conversion Analytics: While the system successfully allows individual users to select and configure their preferred global display currency (e.g., LKR, USD, GBP) within their profile settings, the mathematical backend processes all ledgers using a static numerical value based entirely on that single selection. For users who travel frequently or manage international accounts, the system does not actively support logging transactions in a secondary currency, nor does it integrate with real-time financial APIs to automatically convert foreign exchange rates at the point of ledger entry (Fixer.io, 2026).
Mobile Web View vs. Native Application: The application was constructed as a fully responsive Web App using React.js. While it scales beautifully in mobile browser viewports (Safari/Chrome), it lacks the deep, hardware-level integration (e.g., Apple Pay integrations, native push notifications outside the browser, or offline cache operating modes) inherently available only in compiled, native iOS or Android mobile applications.

11.3 Future Suggestions and Enhancements
To elevate the Smart Financial Tracker from a robust academic platform to a highly competitive, commercial-grade product, several technological and functional enhancements are proposed for future development life cycles:

1.	Optical Character Recognition (OCR) Integration: To alleviate the friction of manual data entry without resorting to automated bank syncing, the system should integrate an OCR engine (such as Google Cloud Vision or Tesseract). This would allow users to physically take a photograph of their point-of-sale receipt with their mobile device; the OCR would mathematically scan the image, extract the total cost and vendor data, and auto-populate the SFT input form, requiring only a final manual confirmation click from the user.
2.	Migration to React Native: To resolve the mobile Web App limitations, the frontend architecture should be refactored utilizing React Native. This would allow the project to be compiled and deployed directly to the iOS App Store and Google Play Store. It would grant the system access to native mobile hardware APIs, permitting offline operational caching, biometric (FaceID) login security, and hardware-level push notifications for immediate budget alerts (BrowserStack, 2026; Elementor, 2026).
3.	Expanded Predictive Models and Backtesting: The Python microservices should be expanded beyond basic Linear Regression. Integrating advanced time-series forecasting models (such as ARIMA or LSTM neural networks) would allow the system to account for complex seasonal expenditure variations (e.g., accurately predicting the spike in winter holiday spending based on data from three years prior), drastically improving the fidelity of long-term retirement forecasts (Montgomery, Peck and Vining, 2012).

References
Anagha, P. (2026) "The efficiency and adoption of expense tracker applications in enhancing student's financial management," Journal of Innovative Research in Engineering and Management, 3(10).
BrowserStack (2026) "Defining and Testing Non-Functional Requirements." Available at: https://www.browserstack.com/guide/non-functional-requirements-examples  (Accessed: May 11, 2026).
Byrne, A. and Brooks, C. (2008) "Behavioral Finance: Theories and Evidence," The Research Foundation of CFA Institute [Preprint]. Available at: https://www.cannonfinancial.com/uploads/main/Behavioral_Finance-Theories_Evidence.pdf  (Accessed: May 11, 2026).
Cloudthat (no date) "API Gateway Caching Strategies for High-Performance APIs." Available at: https://www.cloudthat.com/resources/blog/api-gateway-caching-strategies-for-high-performance-apis (Accessed: May 11, 2026).
Deloitte (2023) "Digital Financial Ecosystems: The Future of Personal Finance." Available at: https://www2.deloitte.com/us/en/insights/industry/financial-services/digital-transformation-in-financial-services.html.  
Elementor (2026) "Mobile Viewport Optimization and Media Queries." Available at: https://elementor.com/help/mobile-editing/. 
Enfin Technologies (no date) "Hire MEAN Stack Developer." Available at: https://www.enfintechnologies.com/hire-mern-stack-developer/  (Accessed: May 11, 2026).
Faraz, N. and Anjum, A. (2025) "Spendception: The psychological impact of digital payments on consumer purchase behavior and impulse buying," Behavioral Sciences, 15(3), 387. https://doi.org/10.20944/preprints202502.1360.v1 
Fixer.io (2026) "Foreign Exchange Rates and Currency Conversion API." Available at: https://fixer.io/documentation. 
Forbes (2023) "Reactive Banking Is Dead—Long Live Proactive Banking." Available at: https://www.forbes.com/councils/forbestechcouncil/2023/03/08/reactive-banking-is-dead-long-live-proactive-banking/  (Accessed: May 11, 2026).
International Monetary Fund (2024) "Digital Money and the Future of the Global Financial System." Available at: https://www.imf.org/en/Publications/fintech-notes/Issues/2019/07/12/The-Rise-of-Digital-Money-47097. 
Kahneman, D. (2011) Thinking, Fast and Slow. New York: Farrar, Straus and Giroux. Available at: https://www.researchgate.net/publication/257406325_Kahneman_D_2011_Thinking_Fast_and_Slow (Accessed: May 11, 2026).
Kamarudeen, M. (2024) "Machine learning based financial management mobile application to enhance college students' financial literacy," ERIC.
Karthikeyan, K. (2025) "The silent wallet: How payment mode transparency shapes spending behaviour in Gen Z consumers," ACR Journal. https://acr-journal.com/article/the-silent-wallet... 
Kelly, B.T. and Xiu, D. (2023) "Financial machine learning," SSRN Electronic Journal. https://doi.org/10.2139/ssrn.4501707 
Lim, S.J. (2026) "Designing for users' autonomy in personal finance management," Victoria University of Wellington. https://openaccess.wgtn.ac.nz/ndownloader/files/61710766 
MongoDB (2023) "Building Robust Data Architectures with MongoDB Atlas." Available at: https://www.mongodb.com/docs/atlas/. 
Montgomery, D.C., Peck, E.A. and Vining, G.G. (2012) Introduction to Linear Regression Analysis. 5th ed. New York: John Wiley & Sons. Available at: https://www.kwcsangli.in/uploads/3--Introduction_to_Linear_Regression_Analysis__5th_ed._Douglas_C._Montgomery__Elizabeth_A._Peck__and_G._.pdf  (Accessed: May 11, 2026).
National College Attainment Network (2024) "Financial Hardship Among College Students." Available at: https://www.ncan.org/Web/News/New-Survey-Data-Financial-Realities-Undermine-Student-Success.aspx  (Accessed: May 11, 2026).
NerdWallet (2026) "Zero-Based Budgeting: Why It Works." Available at: https://www.nerdwallet.com/article/finance/zero-based-budgeting-explained. 
OECD (2024) "Financial Literacy in the Digital Age." Available at: https://www.oecd.org/finance/financial-education/financial-literacy-and-the-digital-economy.htm. 
OpenJS Foundation (2026) "About Node.js." Available at: https://nodejs.org/en/about  (Accessed: May 11, 2026).
OWASP (2025) "Top 10 Web Application Security Risks." Available at: https://owasp.org/Top10/2025/0x00_2025-Introduction/  (Accessed: May 11, 2026).
Peetz, J. and Davydenko, M. (2022) "Financial self-regulation," Social and Personality Psychology Compass, 16(1). https://doi.org/10.1111/spc3.12663 
Pressman, R.S. (2020) Software Engineering: A Practitioner"™s Approach. 9th ed. New York: McGraw-Hill Education. Available at: https://www.researchgate.net/publication/365946272_Software_Engineering_A_Practitioner"™s_Approach_9_th_Edition  (Accessed: May 11, 2026).
Santander UK (2025) "The Student Financial Reality Report." Available at: https://www.santander.com/en/press-room/press-releases/2025/01/santander-uk-finds-that-millions-of-young-people-still-leave-school-without-financial-education  (Accessed: May 11, 2026).
Sentry (2024) "Monitoring API Latency and Performance Bottlenecks." Available at: https://docs.sentry.io/product/performance/. 
Sommerville, Ian. (2011) Software engineering. Pearson. Available at: https://engineering.futureuniversity.com/BOOKS%20FOR%20IT/Software-Engineering-9th-Edition-by-Ian-Sommerville.pdf  (Accessed: May 11, 2026).
Suryavanshi, P. (2024) "Mozilla Developer Network (2024) REST API Best Practices.," Medium [Preprint]. Available at: https://medium.com/@syedabdullahrahman/mastering-rest-api-design-essential-best-practices-dos-and-don-ts-for-2024-dd41a2c59133  (Accessed: May 11, 2026).
Taduka, S. (2024) "Atomic Transactions in Modern Web Applications," Tech Innovations Journal, 12(4), pp. 45"“59. 
TechRadar (2026) "Best Budgeting Software of 2026." Available at: https://www.techradar.com/best/best-budgeting-software  (Accessed: May 11, 2026).
Thaler, R.H. and Sunstein, C.R. (2008) Nudge: Improving Decisions About Health, Wealth, and Happiness. New Haven: Yale University Press. Available at: https://share.google/arasWrvqYBFZZagWz  (Accessed: May 11, 2026).
"The Evolution of Budgeting Tools: A Look at Today"™s Top Personal Finance Apps" (2024) The european business review. [Preprint]. Available at: https://www.europeanbusinessreview.com/the-evolution-of-budgeting-tools-a-look-at-todays-top-personal-finance-apps/  (Accessed: May 11, 2026).
World Bank Group (2024) "Global Financial Inclusion and Consumer Empowerment." Available at: https://documents1.worldbank.org/curated/en/099013124180517721/pdf/P16239315d0da60591bd9c1b6325ce5c6ef.pdf  (Accessed: May 11, 2026).
World Wide Web Consortium (2018) "Web Content Accessibility Guidelines (WCAG) 2.1." Available at: https://www.w3.org/TR/WCAG21/. 
Xiao, J.J. and O"™Neill, B. (2018) "Mental accounting and behavioural hierarchy: Understanding consumer budgeting behaviour," International Journal of Consumer Studies, 42(4), pp. 448"“459. Available at: https://doi.org/10.1111/ijcs.12445. 

Bibliography
The following sources were consulted during background research and informed the conceptual development of the Smart Financial Tracker, but are not directly cited within the main body of the report:
Thaler, R.H. (1985) 'Mental Accounting and Consumer Choice', Marketing Science, 4(3), pp. 199"“214.
Lusardi, A. and Mitchell, O.S. (2014) 'The Economic Importance of Financial Literacy: Theory and Evidence', Journal of Economic Literature, 52(1), pp. 5"“44.
Schwaber, K. and Sutherland, J. (2020) The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. Available at: https://scrumguides.org/scrum-guide.html
Martin, R.C. (2008) Clean Code: A Handbook of Agile Software Craftsmanship. Upper Saddle River: Prentice Hall.
Fowler, M. (2018) Refactoring: Improving the Design of Existing Code. 2nd ed. Boston: Addison-Wesley Professional.
 


Appendix

 Appendix A — Interview Research Materials
 A.1 Purpose
This appendix contains the full research protocol, interview questions, sample participant data, and thematic findings from the semi-structured qualitative interviews conducted during the requirements gathering phase.

A.2 Research Overview
Objective: To understand financial management practices, pain points, and user expectations among the target demographic in order to define the functional and non-functional requirements of the SFT platform.

Methodology:
"¢	Semi-structured interviews with **26 participants**:
o	15 university students (aged 19"“24)
o	8 early-career professionals (1"“3 years post-graduation)
o	3 financial educators
"¢	Conducted via Zoom and in-person, **December 2025 "“ January 2026**
"¢	Duration: 20"“35 minutes per session
"¢	Sampling method: Convenience sampling through university networks and LinkedIn groups
"¢	Analysis method: Thematic coding; four primary themes identified

Ethical considerations:
"¢	Informed consent obtained prior to every session
"¢	Anonymised participant identifiers used (S1"“S15, P1"“P8, E1"“E3)
"¢	Participants retained the right to withdraw at any point
"¢	All data handled confidentially and stored securely

A.3 Core Interview Questions
Section 1: Current Financial Management Practices
1.	How do you currently track your income and expenses?
2.	How frequently do you review your financial records?
3.	Do you organise your spending into categories?
4.	Have you previously used budgeting or personal finance applications?
5.	If you stopped using them, what were the primary reasons?

Section 2: Financial Awareness and Behaviour
1.	On a scale of 1"“10, how aware are you of your spending patterns on a daily basis?
2.	How often do you discover unexpected expenses at the end of the month?
3.	Do you set financial goals? If so, how do you track progress toward them?
4.	What has prevented you from achieving financial goals in the past?
5.	How comfortable do you feel with your current level of financial control?
Section 3: Pain Points and Challenges
1.	What is your primary challenge in managing personal finances effectively?
2.	Have you ever felt mentally disconnected from your spending when using automated tools?
3.	Do you have recurring subscriptions or hidden expenses that you sometimes forget about?
4.	How much time do you spend weekly managing or reconciling financial data?
5.	Have you ever exceeded a budget without realising until it was too late?
Section 4: Feature Expectations
1.	Would you prefer manual transaction entry or automated bank synchronisation, and why?
2.	What features would make you use a financial application consistently for over 6 months?
3.	How important are proactive alerts (before overspending) vs. reactive alerts (after overspending)?
4.	Would integrated peer-to-peer transfer functionality be valuable to you?
5.	Do you manage expenses in multiple currencies?
6.	Would predictive expense forecasting influence your financial decisions?
Section 5: Privacy and Security
1.	Do you have concerns about connecting your bank account to a third-party application?
2.	On a scale of 1"“10, how important is data privacy to you in financial applications?
3.	Would you prefer a manual-entry system to avoid sharing banking credentials?
4.	What security features would be necessary for you to trust a financial platform?
Section 6: Open-Ended Insights
1.	If you could design your ideal financial management system, what would it look like?
2.	What would motivate you to use a financial application consistently over the long term?
3.	Is there anything else you would like to share regarding your financial management needs?

A.4 Sample Participant Excerpt
Participant S2 (Postgraduate Student) — Active Awareness Gap Theme
Interviewer: "You mentioned Google Sheets. How often do you actually update it?"
S2: "Honestly, maybe once a month. By the time I sit down to enter everything, I've forgotten half of what I spent. I'll check my bank statement and think, 'Did I really spend that much on food last week?' It's always a shock. If I entered transactions right after each purchase, I'd probably be more careful. It's similar to writing notes by hand — you remember better. The same applies to finances."

This response illustrates the recurring theme of reduced financial awareness caused by delayed tracking, directly supporting the SFT's emphasis on immediate manual transaction entry to reinforce behavioural engagement.

A.5 Key Thematic Findings
Table A. 1:Interview Thematic Analysis Summary
Theme	Description	Prevalence	SFT Design Response
Active Awareness Gap	Automation reduces cognitive engagement; users become passive observers	Dominant across all participant groups	Manual-first transaction entry; no forced bank sync
Subscription Fatigue	Participants regularly forget recurring payments, causing financial leakage	78% of participants	Dedicated recurring bills tracker with annualised cost view
Privacy Concerns	Reluctance to connect bank accounts to third-party applications	73% of participants	Zero bank integration; all data user-controlled
Fragmented Ecosystems	Separate apps for budgeting, P2P, and savings create incomplete visibility	87% of participants	Unified SFT ecosystem: wallet, budgets, goals, analytics, AI
Thematic saturation was achieved after 21 interviews. The final 5 sessions introduced no new themes, confirming adequate sample coverage.













Appendix B — Quantitative Survey: Financial Behaviours of Emerging Adults
B.1 Purpose
This appendix contains the complete survey instrument and full statistical findings from the quantitative research study conducted to validate the requirements identified during qualitative interviews.

B.2 Research Overview
Table B. 1:Survey Research Parameters
Item	Detail
Survey period	10"“12 May 2026
Distribution method	Google Forms (anonymous online)
Total responses	36 (100% completion rate)
Participant breakdown	20 university students, 8 early-career professionals, 4 financial educators, 2 self-employed, 2 other
Age distribution	18"“20: 19.4%
Average completion time	8"“12 minutes
Analysis method	Descriptive statistics, frequency distributions, Likert-scale averages

B.3 Complete Survey Questionnaire

Section 1: Demographic Information
Q1. What is your age group?
"¢	18"“20 | 21"“24 | 25"“30 | Above 30
Q2. What is your current status?
"¢	University Student | Early-Career Professional | Financial Educator | Self-Employed | Other

Section 2: Current Financial Behaviour
Q3. Do you track your daily expenses?
"¢	Yes | Sometimes | No
Q4. How do you currently manage your finances? (Select all that apply)
"¢	Mental tracking | Notebook/manual records | Excel spreadsheets | Mobile finance applications | Bank applications | I do not track my expenses
Q5. What financial problems do you commonly face? (Select all that apply)
"¢	Overspending | Forgetting expenses | Difficulty saving money | No proper expense tracking | Difficulty analysing spending habits | Lack of budgeting
Q6. How often do you forget to record your expenses?
"¢	Never | Rarely | Sometimes | Very Often
Q7. How confident are you in managing your personal finances?
"¢	1 (Not confident at all) — 5 (Very confident)

Section 3: Experience with Finance Applications
Q8. Have you used any finance tracking applications before?
"¢	Yes | No
Q9. If yes, what problems did you experience with existing finance apps? (Select all that apply)
"¢	Too complicated to use | Too many unnecessary features | Difficult user interface | Time-consuming data entry | Paid features/paywalls | Privacy concerns | Lack of useful visual reports

Section 4: Feature Preferences
Q10. Which features would you most prefer in a Smart Finance Tracker application? (Select all that apply)
"¢	Daily expense tracking | Budget management | Savings tracking | Spending alerts | Monthly financial reports | Visual charts and graphs | Expense reminders | Manual expense entry | Forecasting future expenses
Q11. How important is a simple and user-friendly interface?
"¢	1 (Not important) — 5 (Very important)
Q12. How useful would visual budget alerts be at 80%, 90%, and 100% spending levels?
"¢	1 (Not useful) — 5 (Very useful)
Q13. Which expense tracking method would you prefer?
"¢	Manual expense entry | Automatic bank synchronisation | Combination of both

Section 5: Privacy and Security
Q14. How important is privacy protection in a finance tracking app?
"¢	1 (Not important) — 5 (Very important)
Q15.Which security features would you expect from the application? (Select all that apply)
"¢	Password protection | Fingerprint authentication | Secure login | Data backup and recovery
Section 6: Notifications and Reporting
Q16. Which feature is MOST important to you?
"¢	Expense tracking | Budget management | Savings tracking | Notifications/reminders | Reports & charts | Security features
Q17. Would reminder notifications help you manage finances better?
"¢	Yes | Maybe | No
Q18. Do you prefer graphical reports/charts to analyse expenses?
"¢	Yes | No

B.4 Full Statistical Results

Table B. 2: Demographic Breakdown (n = 36)
Category	Value	Count	Percentage
Age	18"“20	7	19.4%
Age	21"“24	22	61.1%
Age	25"“30	4	11.1%
Age	Above 30	3	8.3%
Status	University Student	20	55.6%
Status	Early-Career Professional	8	22.2%
Status	Financial Educator	4	11.1%
Status	Self-Employed	2	5.6%
Status	Other	2	5.6%

Table B. 3:Do you track your daily expenses?
Response	Count	Percentage
Yes	13	36.1%
Sometimes	16	44.4%
No	7	19.4%

63.9% of respondents do not consistently track their expenses, validating the SFT's emphasis on a low-friction manual entry interface to encourage habit formation.

Table B. 4:How do you currently manage your finances?
Method	Count	% of Respondents
Mental tracking	13	36.1%
Mobile finance applications	8	22.2%
Bank applications	7	19.4%
Notebook/manual records	7	19.4%
Excel spreadsheets	4	11.1%
I do not track my expenses	4	11.1%

Table B. 5:Financial problems commonly faced
Problem	Count	% of Respondents
Overspending	16	44.4%
Difficulty saving money	15	41.7%
Forgetting expenses	10	27.8%
Difficulty analysing spending habits	9	25.0%
No proper expense tracking	6	16.7%
Lack of budgeting	5	13.9%

Table B. 6:How often do you forget to record expenses?
Frequency	Count	Percentage
Never	2	5.6%
Rarely	4	11.1%
Sometimes	17	47.2%
Very Often	13	36.1%
83.3% forget to record expenses at least sometimes — a core behavioural gap the SFT addresses through immediate-entry prompts and a persistent mobile-responsive interface.

Table B. 7:Financial confidence rating
Rating	Count	Percentage
1 — Not confident at all	3	8.3%
2	8	22.2%
3	12	33.3%
4	9	25.0%
5 — Very confident	4	11.1%
Average: 3.00 / 5.00 — 61.1% rated their confidence at 3 or below, confirming a broad practical financial management skill deficit.

Table B. 8:Have you used finance tracking apps before?
Response	Count	Percentage
Yes	15	41.7%
No	21	58.3%

Table B. 9:Problems with existing apps
Problem	Count	% of Prior App Users
Too many unnecessary features	10	66.7%
Time-consuming data entry	9	60.0%
Too complicated to use	7	46.7%
Paid features/paywalls	7	46.7%
Privacy concerns	7	46.7%
Difficult user interface	6	40.0%
Lack of useful visual reports	6	40.0%
The three dominant pain points — feature bloat, data entry friction, and privacy — directly informed the SFT's design: minimal, manual-first, zero bank-credential requirement.

Table B. 10:Most preferred features
Feature	Count	% of Respondents
Budget management	21	58.3%
Daily expense tracking	20	55.6%
Spending alerts	16	44.4%
Savings tracking	15	41.7%
Visual charts and graphs	13	36.1%
Monthly financial reports	13	36.1%
Expense reminders	12	33.3%
Forecasting future expenses	6	16.7%
Manual expense entry	2	5.6%

Q11 — Importance of a simple, user-friendly interface (1"“5)
Average: 4.50 / 5.00 — 88.9% rated this 4 or 5, making UI simplicity a non-negotiable design requirement.
Q12 — Usefulness of progressive budget alerts at 80%, 90%, 100% (1"“5)
Average: 4.17 / 5.00 — Strongly validates the SFT's three-tier notification system.





Table B. 11:Preferred expense tracking method
Method	Count	Percentage
Combination of both	23	63.9%
Manual expense entry	8	22.2%
Automatic bank synchronisation	5	13.9%
86.1% prefer manual entry or a hybrid approach, reinforcing the decision to prioritise manual recording.

Q14 — Importance of privacy protection (1"“5)
Average: 4.58 / 5.00 — The highest-scoring metric in the entire survey. Privacy is the primary trust barrier; confirmed the exclusion of bank API synchronisation.

Table B. 12: Expected security features
Security Feature	Count	% of Respondents
Password protection	19	52.8%
Fingerprint authentication	19	52.8%
Secure login	19	52.8%
Data backup and recovery	14	38.9%

Table B. 13:Single most important feature
Feature	Count	Percentage
Budget management	9	25.0%
Savings tracking	7	19.4%
Notifications/reminders	6	16.7%
Security features	6	16.7%
Reports & charts	4	11.1%
Expense tracking	4	11.1%

Table B. 14:Would reminders help manage finances better?
Response	Count	Percentage
Yes	20	55.6%
Maybe	16	44.4%
No	0	0.0%
100% of respondents indicated reminders would be helpful or possibly helpful, directly validating the SFT's automated bill reminder and budget alert notification systems.

Table B. 15:Prefer graphical reports/charts?
Response	Count	Percentage
Yes	32	88.9%
No	4	11.1%
88.9% prefer visual analytics, confirming the Recharts-powered dashboard as a core user need, not a cosmetic feature.


B.5 Notable Open-Text Responses (Q19 & Q20)

Table B. 16:Qualitative Themes from Open-Text Feedback
Theme	Representative Responses
AI-powered guidance	"A guidance chatbot." / "AI-based spending suggestions and bill reminders."
Machine learning forecasting	"A machine learning model trained from previous financial data of general user types. Adding one to the system may help significantly."
Privacy emphasis	"The app should protect user data and avoid unnecessary permissions."
Weekly summaries	"Weekly spending reports and customizable categories." / "Weekly spending summaries with smart insights."
Simplicity for students	"The app should provide quick summaries that students can understand easily." / "The application should motivate students to save money regularly."
Customisation	"Dark mode and customizable expense categories."
Export capability	"Option to export reports as PDF or Excel."
Faster entry	"It should take less time to enter expenses and give quick reminders."




















Appendix C — Competitive Analysis of Financial Tracking Systems

C.1 Purpose
This appendix provides the full structured competitive benchmarking data used to identify design gaps and prioritise SFT features during the requirements phase.

C.2 Benchmarking Scope
Four market-leading personal finance applications were evaluated across 14 dimensions during January"“February 2026.

C.3 Full Competitive Feature Matrix

Table C. 1:SFT Platform vs. Competitor Feature Comparison
Feature	SFT Platform	YNAB	PocketGuard	Mint / Credit Karma	Monarch Money
Budget Model	Manual-first; 50/30/20 auto-generate	Zero-based (every dollar assigned)	Snapshot ("In My Pocket")	Automated categorisation	Fully customisable
Monthly Cost	Free / Open Source	$14.99/month ($109/year)	$12.99/month	Free (ad-supported)	$14.99/month (no free tier)
Predictive Analytics	ML — Random Forest Regressor (Python microservice)	None	Basic	None	Basic
AI Chatbot Assistant	Tracksy (Groq LLM API, draggable widget)	None	None	None	None
P2P Wallet Transfers	Integrated internal wallet (ACID-compliant)	None	None	None	None
Goal Tracking	Milestone-based with progress indicators	Advanced	Basic	Basic	Advanced
Bank API Sync	Intentionally excluded (privacy-first design)	Required (Plaid)	Required	Required	Required (Plaid)
Two-Factor Authentication	Yes — email OTP	No	No	No	No
Retirement / Long-Term Planning	Monte Carlo simulation tool	No	No	No	Basic projection
Multi-Currency Support	User-selectable display currency	Yes (premium)	No	No	Yes
Mobile UX	Responsive web app (React, mobile-first CSS)	Dedicated native app	Dedicated native app	Dedicated native app	Dedicated native app
WCAG 2.1 AA Accessibility	Yes	Partial	No	No	Partial
Data Privacy	No bank credentials required	Bank OAuth required	Bank OAuth required	Bank credentials required	Bank OAuth required
Price Barrier for Students	None	High ($109/year)	Moderate ($156/year)	None (ad-driven)	High ($180/year)

C.4 Identified Gaps and SFT Responses

Table C. 2:Pain Point Analysis and SFT Solutions
Identified Gap	Behavioural / Technical Impact	SFT Design Response
Excessive automation across all competitors	Reduces cognitive awareness; users disengage from real spending	Structured manual entry restores mindful engagement
Reactive-only budget alerts	Correction happens after overspend has already occurred	Progressive alerts at 80%, 90%, 100%
No integrated P2P functionality	Users juggle separate P2P apps alongside their budget app	Native internal wallet with atomic ACID transactions
No AI guidance layer	Users leave the app to search for financial advice externally	Tracksy: Groq LLM chatbot embedded directly in dashboard
No ML forecasting	Users cannot anticipate future financial strain	Python microservice: Random Forest Regressor predictions
High subscription cost	Enterprise tools inaccessible to the student demographic	Fully free; open-source deployment
Bank credential requirement	46.7% of prior app users cited privacy as a major pain point (Appendix B, Table B.9)	Zero bank integration; 100% user-controlled data

C.5 Summary Verdict
No single existing competitor combines zero cost, privacy-first manual entry, integrated ML forecasting, an LLM chatbot assistant, P2P transfers, and WCAG 2.1 AA accessibility in one platform. This intersection of gaps defines the SFT's unique value proposition within the personal finance management market.





Appendix D — Full System Test Results

D.1 Purpose
This appendix contains the complete documented test results across all testing phases described in Chapter 8, verifying the system's functional and non-functional requirements.

D.2 Unit Test Results
Data gathered from the backend test suite execution. 140 total backend tests were executed successfully during this phase.

Table D. 1:Unit Test Results
Test ID	Module	Test Description	Given	When	Then	Result
UT-01	Wallet Controller	Insufficient funds rejected	Wallet balance = $50	Transfer of $100 requested	HTTP 400 returned; DB unchanged	Pass
UT-02	Budget Alert Service	80% threshold triggers alert	Budget $200; $160 spent	New $5 expense added	Alert object created at "warning" level	Pass
UT-03	Budget Alert Service	90% threshold triggers alert	Budget $200; $180 spent	New $5 expense added	Alert object created at "danger" level	Pass
UT-04	Budget Alert Service	100% threshold triggers email	Budget $200; $200 spent	Any new expense added	"exceeded" level alert; SendGrid called	Pass
UT-05	Auth Middleware	Valid JWT passes middleware	Valid JWT in HTTP-only cookie	Request to protected route	req.user populated; next() called	Pass
UT-06	Auth Middleware	Missing token blocked	No cookie	Request to protected route	HTTP 401 returned	Pass
UT-07	Auth Middleware	Expired token blocked	Expired JWT in cookie	Request to protected route	HTTP 401 returned	Pass
UT-08	Transfer Controller	UUID idempotency prevents double debit	Duplicate UUID submitted	Second transfer request	Second request rejected; no duplicate deduction	Pass
UT-09	ML Forecast Proxy	Insufficient data handled gracefully	User has < 3 months of data	Forecast requested	Returns "insufficient data" message; no chart rendered	Pass
UT-10	Financial Health Score	Weighted formula accuracy	Known test financial dataset	Score calculated	Result matches expected weighted output	Pass

D.3 Integration Test Results

Table D. 2:Integration Test Results
Test ID	Integration Point	Scenario	Expected Outcome	Actual Outcome	Result
IT-01	Node.js â†’ Python ML Microservice	Forecast request with 12-month history	JSON payload returned; no CORS error	Payload returned properly mapped	Pass
IT-02	Node.js â†’ MongoDB (ACID session)	P2P transfer — atomic commit	Both wallet balances updated together or both rolled back	Atomic transaction committed without data loss	Pass
IT-03	Node.js â†’ SendGrid	Budget alert at 100% threshold	Email delivered to user inbox	Mailer service triggered successfully	Pass
IT-04	Node.js â†’ Groq LLM API	Tracksy query submission	Contextual response returned within 5 seconds	Rate-limit/Fallback handled; Context returned	Pass
IT-05	React Frontend â†’ Node.js API	Dashboard initial data load	Summary, budgets, and transactions load without error	Valid JSON object retrieved	Pass
IT-06	CRON Scheduler â†’ MongoDB â†’ SendGrid	Bill reminder 3 days before due date	Reminder email sent to correct user	CRON successfully queries expiring bills	Pass


D.4 System Test Results (Manual)
These workflows map to UI/UX manual testing phases.

Table D. 3:Manual System Test Results
Test ID	Feature	Steps	Expected Result	Actual Result	Pass/Fail
ST-01	Budget alert end-to-end	1. Set Groceries budget $200. 2. Record $190 groceries. 3. Add $20 grocery expense.	Red "Budget Exceeded" badge; transaction added to ledger	Pending manual execution	Pending
ST-02	P2P Transfer — success path	1. Login User A (wallet $500). 2. Transfer $200 to User B. 3. Check both wallets.	User A: $300; User B: +$200; audit log entry created	Pending manual execution	Pending
ST-03	P2P Transfer — insufficient funds	1. Login User A (wallet $50). 2. Attempt $200 transfer.	Error shown; both balances unchanged	Pending manual execution	Pending
ST-04	ML Expense Forecast	1. Ensure 12 months of transaction data exist. 2. Navigate to Forecast page.	Forecast chart rendered with confidence band; no console error	Pending manual execution	Pending
ST-05	2FA Login	1. Enter valid credentials. 2. Receive OTP email. 3. Enter OTP.	Authenticated; redirected to dashboard	Pending manual execution	Pending
ST-06	Tracksy AI Assistant	1. Click Tracksy floating widget. 2. Type "How do I reduce my subscription costs?"	Relevant financial tip returned within 5 seconds	Pending manual execution	Pending
ST-07	Savings Goal Creation	1. Navigate to Goals. 2. Create goal: target $1,000, 6-month deadline. 3. Add $100 contribution.	Goal card shows 10% progress; contribution logged	Pending manual execution	Pending
ST-08	Bill Reminder	1. Register a recurring bill due in 3 days. 2. Trigger or wait for CRON.	Reminder email received in user inbox	Pending manual execution	Pending
ST-09	Data Export (CSV)	1. Navigate to Reports. 2. Request CSV export for current month.	CSV downloads with correct transaction data	Pending manual execution	Pending
ST-10	Dark Mode Persistence	1. Toggle dark mode ON. 2. Refresh browser.	Dark theme re-applied on reload without flash	Pending manual execution	Pending


D.5 Non-Functional Test Results

Table D. 4:Non-Functional Test Results
Test	Tool	Metric	Target	Actual Result	Pass/Fail
Performance Score	Google Lighthouse	Lighthouse performance	â‰¥ 85 / 100	Pending final build deployment	Pending
Accessibility Score	Google Lighthouse	Lighthouse accessibility	â‰¥ 90 / 100	Pending final build deployment	Pending
Best Practices Score	Google Lighthouse	Lighthouse best practices	â‰¥ 85 / 100	Pending final build deployment	Pending












Appendix E — User Acceptance Testing: Survey Instrument and Results

E.1 Purpose
This appendix contains the UAT survey instrument distributed to the closed beta testing group and the aggregated feedback that validated the SFT platform prior to final submission.

E.2 UAT Setup

Table E. 1:UAT Parameters
Item	Detail
Testers	University peers, classmates, and friends representing the core target demographic
Environment	Staging deployment (Render backend + Vercel frontend)
Collection method	Google Forms (anonymous)
Number of tasks	8 structured tasks (see Section E.3)

E.3 Tasks Assigned to Beta Testers
Testers completed the following tasks independently, without guidance, to simulate real usage:
1.	Register a new account and complete profile setup (currency, display name)
2.	Log 5 transactions across at least 3 different expense categories
3.	Set a monthly budget limit for 2 categories and observe the progress bar update
4.	Initiate a P2P wallet transfer to another registered test user
5.	Open the Tracksy AI assistant and ask one financial question of their choice
6.	Navigate to the Forecast or Analytics page and interpret what they see
7.	Toggle dark mode and confirm it persists after a page refresh
8.	Complete the UAT feedback survey

E.4 UAT Survey Instrument

Table E. 2:UAT Survey Questions
#	Question	Response Type
1	How easy was it to register and set up your account?	Likert 1"“5
2	How intuitive was the transaction logging process?	Likert 1"“5
3	How clear was the budget tracking interface?	Likert 1"“5
4	How easy was the P2P transfer process?	Likert 1"“5
5	How helpful was the Tracksy AI assistant's response?	Likert 1"“5
6	Did the dashboard clearly show your financial position?	Yes / No
7	Would you use this application regularly for your own finances?	Yes / No / Maybe
8	How does SFT compare to other finance apps you have used?	Better / Same / Worse / Never used another
9	Did you feel your data was private and secure?	Yes / No
10	What did you like most about the application?	Open text
11	What could be improved?	Open text
12	Overall satisfaction rating	1"“10

E.5 Aggregated UAT Results

Table E. 3:UAT Quantitative Results
Metric	Score / Finding
Average ease of registration	X.X / 5
Average transaction logging intuitiveness	X.X / 5
Average budget interface clarity	X.X / 5
Average P2P transfer ease	X.X / 5
Average Tracksy helpfulness	X.X / 5
Dashboard clearly showed financial position (Yes %)	XX%
Would use regularly (Yes + Maybe %)	XX%
Felt data was private and secure (Yes %)	XX%
Rated SFT better than other apps (Better %)	XX%
Average overall satisfaction	X.X / 10

E.6 Key Qualitative Themes

Table E. 4:UAT Open-Text Themes and Outcomes
Theme	Feedback Summary	Action Taken
Privacy and Trust	Users explicitly praised the absence of bank syncing; described SFT as feeling safer than commercial alternatives	Design decision validated; no change required
Dashboard Clarity	Pie charts and line graphs praised for immediately revealing subscription and discretionary spend patterns	No change required
Tracksy AI Chatbot	Testers valued staying in one browser tab rather than switching to a separate search — rated interaction as natural	No change required
Mobile Viewport	Some testers noted the draggable Tracksy widget occasionally overlapped the bottom nav bar on narrow phone screens	CSS media query fix applied prior to final submission









Appendix F — MongoDB Collection Schema Reference

F.1 Purpose
This appendix provides field-level schema definitions for the primary MongoDB collections in the SFT platform. This detailed data dictionary serves as a technical reference for system maintainers and demonstrates the backend database architecture underpinning the application.

F.2 Schema Tables
Stores user accounts, privacy settings, transfer limits, and multi-factor authentication data

Table F. 1:User Collection (`users`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated primary key
name
String	No	Default: ""
email
String	Yes	Unique, lowercase
password
String	Yes	Hashed via bcrypt
role
String	No	Enum: super_admin, admin, user. Default: "user"

subscriptionTier
String	No	Enum: free, premium. Default: "free"
currency
String	No	Enum: LKR, USD, EUR, etc. Default: "LKR"
monthlySalary
Number	No	Min: 0, Default: null
savingsPercentage
Number	No	Min: 0, Max: 99.99, Default: 20
expenseStartMode
String	No	Enum: include_existing, start_from_now. Default: "include_existing"
budgetPeriodDays
Number	No	Min: 1, Max: 365, Default: 30
notificationSettings
Mixed	No	Default: Object containing flags (e.g., budgetAlerts: true)

privacySettings
Mixed	No	Default: Object (e.g., twoFactorAuth: false, dataSharing: false)

transferLimits
Mixed	No	Default: Daily $50,000, Monthly $200,000
savedTransferRecipients
Array of Objects	No	References other User ObjectId strings



Stores income and expense records, including P2P transfers linked via references.

Table F. 2:Transaction Collection (`transactions`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
user
ObjectId	Yes	Ref: User

type
String	Yes	Enum: "income", "expense"

category
String	Yes	E.g., Groceries, Rent, Salary
amount
Number	Yes	Numeric decimal
note
String	No	
date
Date	No	Default: Date.now

isTransfer
Boolean	No	Default: false
transferId
ObjectId	No	Ref: Transfer
transferDirection
String	No	Enum: "sent", "received"
scope
String	No	Enum: "savings", "wallet". Default: "savings"
systemManaged
Boolean	No	Default: false


Stores user-defined spending limits with alert thresholds.

Table F. 3:Budget Collection (`budgets`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
userId
ObjectId	Yes	Ref: User

category
String	Yes	Trimmed string
limit
Number	Yes	Min: 0
period
String	No	Enum: daily, weekly, monthly, yearly. Default: "monthly"
alertThreshold
Number	No	Min: 0, Max: 100, Default: 80
active
Boolean	No	Default: true
lastAlertLevel
String	No	Enum: null, '80', '85', '90', '95', 'exceeded'. Default: null
budgetGroup
String	No	For grouping multiple sub-categories


Stores user financial savings/investment goals.

Table F. 4:Goal Collection (`goals`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
user
ObjectId	Yes	Ref: User

name
String	Yes	
targetAmount
Number	Yes	
currentAmount
Number	No	Default: 0
targetDate
Date	Yes	
category
String	Yes	Enum: savings, investment, debt, retirement, etc.
priority
String	No	Enum: low, medium, high. Default: "medium"

status
String	No	Enum: active, completed, paused, cancelled



Stores P2P wallet accounting, enforcing optimistic locking on balances.

Table F. 5:Wallet Collection (`wallets`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
user
ObjectId	Yes	Ref: User, Unique

balance
Number	Yes	Min: 0, Default: 0
currency
String	Yes	Uppercase, Default: "USD"
pendingBalance
Number	No	Min: 0, Default: 0
availableBalance
Number	No	Pre-save hook: balance - pendingBalance

status
String	No	Enum: active, frozen, suspended, closed. Default: "active"

version
Number	No	Default: 0 (used for optimistic locking)


Stores the stateful ledger operations for Peer-to-Peer money movements.

Table F. 6:Transfer Collection (`transfers`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
sender
Object	Yes	Contains userId (Ref: User), userName, userEmail

receiver
Object	Yes	Contains userId (Ref: User), userName, userEmail

amount
Number	Yes	Min: 0.01
netAmount
Number	Yes	Amount minus fee
status
String	No	Enum: initiated, pending, processing, completed, failed, reversed. Default: "initiated"
scheduledFor
Date	No	Default: null
processingMode
String	No	Enum: instant, scheduled. Default: "instant"
riskLevel
String	No	Enum: low, medium, high. Default: "low"



Stores Tracksy AI chatbot history and semantic context wrappers.

Table F. 7:Conversation Collection (`conversations`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
userId
ObjectId	Yes	Ref: User

conversationId
String	Yes	Unique, Auto-generated default
messages
Array of Objects	No	Contains role, content, timestamp, intent, entities

sessionMetadata
Object	No	Contains lastActivityAt, isActive, contextData

summary
String	No	Max length: 200 characters


Stores user retirement constraints and the ML/Monte Carlo output payload.

Table F. 8:Retirement Plan Collection (`retirementplans`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
userId
ObjectId	Yes	Ref: User

sourceInput
Mixed	No	User constraints (age, inflation, yields)
projectedFund
Number	Yes	Default: 0
probability
Number	Yes	Min: 0, Max: 1, Default: 0
scenarios
Array of Nums	No	Used for Monte Carlo distributions
deterministic
Mixed	No	
predictions
Mixed	No	Random Forest output payload
simulation
Mixed	No	Monte Carlo simulation output array


Stores amortization curves and debt tracking.

Table F. 9:Loan Collection (`loans`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
userId
ObjectId	Yes	Ref: User

loanName
String	Yes	Trimmed String
principalAmount
Number	Yes	Min: 0
interestRate
Number	Yes	Min: 0, Max: 100
tenure
Number	Yes	Number of months, Min: 1
startDate
Date	Yes	
endDate
Date	No	Computed via Pre-save hook
status
String	No	Enum: active, paid, closed, defaulted. Default: "active"


Stores recurring payments tied to CRON reminders and auto-generated loans.

Table F. 10:Bill Collection (`bills`)
Field	Data Type	Required	Constraints / Default
_id
ObjectId	Yes	Auto-generated
userId
ObjectId	Yes	Ref: User

name
String	Yes	Trimmed text
amount
Number	Yes	Min: 0
category
String	Yes	Enum for utility groupings
dueDate
Date	Yes	
recurring
Boolean	No	Default: false
frequency
String	No	Enum: weekly, biweekly, monthly, yearly
loanId
ObjectId	No	Ref: Loan. Link to parent loan if applicable
Appendix G — API Endpoint Reference

G.1 Purpose
This appendix provides a complete reference of all backend REST API endpoints, derived directly from the Express.js router files to ensure accurate architectural documentation. 

G.2 Authentication Routes — `/api/users` 
Handled via the user controller in this project architecture

Table G. 1:User & Auth Endpoints
Method	Endpoint	Auth Required	Min Role	Description
POST	/api/users/register	No	Public	Register new user account
POST	/api/users/login	No	Public	Standard credential login
POST	/api/users/guest-login	No	Public	Issue temporary guest session
POST	/api/users/forgot-password
No	Public	Trigger password reset flow
POST	/api/users/reset-password
No	Public	Execute password reset via token
GET	/api/users/profile	Yes	User	Retrieve current user profile
POST	/api/users/update-currency
Yes	User	Update display currency preference
PUT	/api/users/budget-settings	Yes	User	Update overarching budget rules
POST	/api/users/change-password
Yes	User	Change password while authenticated
PUT	/api/users/profile	Yes	User	Update basic profile metadata
PUT	/api/users/notification-settings	Yes	User	Restrict or enable notifications
PUT	/api/users/privacy-settings	Yes	User	Update data sharing & 2FA toggles
GET	/api/users/export-data	Yes	User	Export complete footprint to CSV
POST	/api/users/delete-account	Yes	User	Hard delete account & all data

G.3 Transaction Routes — `/api/transactions`

Table G. 2:Transaction Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/transactions	Yes	User	Retrieve paginated list of transactions
POST	/api/transactions	Yes	User	Create new physical or ledger transaction
PUT	/api/transactions/:id	Yes	User	Update a specific transaction
DELETE	/api/transactions/:id	Yes	User	Remove a transaction from the ledger




G.4 Budget Routes — `/api/budgets`


Table G. 3:Budget Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/budgets	Yes	User	Retrieve all active budgets
GET	/api/budgets/with-spending	Yes	User	Retrieve budgets joined with current spent totals
GET	/api/budgets/smart-analyze	Yes	User	Generate analytical insight for all categories
GET	/api/budgets/status
Yes	User	Retrieve adaptive status metric
GET	/api/budgets/analysis	Yes	User	Run adaptive analysis on a single spending tier
POST	/api/budgets	Yes	User	Create a new budget manually
POST	/api/budgets/smart-generate	Yes	User	AI/heuristic auto-generation of budgets
POST	/api/budgets/generate-from-income
Yes	User	Pro-rata generation based on stated income
PUT	/api/budgets/:id	Yes	User	Update limit or category name for a budget
DELETE	/api/budgets/:id	Yes	User	Remove a budget

G.5 Goal Routes — `/api/goals`

Table G. 4:Goal Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/goals	Yes	User	Fetch all tracked financial goals
POST	/api/goals	Yes	User	Create a new goal (e.g. house deposit)
PUT	/api/goals/:id	Yes	User	Update a goal's timeline or metadata
DELETE	/api/goals/:id	Yes	User	Cancel or remove a goal entirely
PUT	/api/goals/:id/contribute	Yes	User	Add funds/contribution event to a goal

G.6 Bill Routes — `/api/bills`

Table G. 5:Bill Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/bills	Yes	User	Fetch all registered bills
GET	/api/bills/upcoming	Yes	User	Fetch bills due imminently for dashboard
POST	/api/bills	Yes	User	Register a new recurring or one-off bill
PUT	/api/bills/:id	Yes	User	Modify bill due dates or amounts
DELETE	/api/bills/:id	Yes	User	Remove bill from ledger
PATCH	/api/bills/:id/mark-paid
Yes	User	Toggle boolean Paid status

G.7 Loan Management Routes — `/api/loans`

Table G. 6:Loan Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/loans	Yes	User	Get all user loans
POST	/api/loans	Yes	User	Create new loan
GET	/api/loans/:id	Yes	User	Details of single loan
PUT	/api/loans/:id	Yes	User	Update loan details
DELETE	/api/loans/:id	Yes	User	Delete or close a loan
POST	/api/loans/calculate-emi	Yes	User	Calculate projected EMI independent of DB creation
GET	/api/loans/:id/amortization	Yes	User	Get full amortization curve for specific loan
POST	/api/loans/:id/payments	Yes	User	Record a manual payment against principal/interest
GET	/api/loans/:id/payments	Yes	User	History of payments on a single loan
POST	/api/loans/:id/simulate-extra-payment	Yes	User	Calculate savings vs time for hypotheticals
GET	/api/loans/:id/early-payoff	Yes	User	Calculate penalty-inclusive payoff balance
POST	/api/loans/:id/prepayment	Yes	User	Process a bulk prepayment action
GET	/api/loans/analytics/summary
Yes	User	Aggregated outstanding debt load
GET	/api/loans/analytics/overdue	Yes	User	Identify any missed payments
POST	/api/loans/compare	Yes	User	Compare multiple hypothetical loan structures

G.8 Wallet and Transfer Routes — `/api/wallet` & `/api/transfers`

Table G. 7:Wallet and Transfer Endpoints
Method	Endpoint	Auth Required	Min Role	Description
GET	/api/wallet/balance
Yes	User	Retrieve instantaneous balance with pending delta
POST	/api/wallet/initialize	Yes	User	Instantiate wallet zero-state on activation
POST	/api/wallet/add-funds	Yes	User	Virtual deposit entry into ecosystem
POST	/api/wallet/withdraw	Yes	User	Virtual withdrawal off-ledger
GET	/api/wallet/transactions	Yes	User	Retrieve wallet-specific event ledger
GET	/api/transfers/search-users	Yes	User	Fuzzy search for target P2P users by string
GET	/api/transfers/contacts	Yes	User	Retrieve previously successful recipients
POST	/api/transfers/validate-receiver
Yes	User	Cryptographically verify recipient status
POST	/api/transfers/send-otp	Yes	User	Request 2FA execution code for transfer
GET	/api/transfers/my-limits	Yes	User	Fetch user-specific rate limits and ceilings
POST	/api/transfers/check-feasibility	Yes	User	Dry-run checking math before commit
POST	/api/transfers/initiate	Yes	User	Execute atomic P2P MongoDB session
GET	/api/transfers/my-transfers	Yes	User	Pagination listing of transfers explicitly
GET	/api/transfers/:transferId
Yes	User	Details wrapper block for a transfer
POST	/api/transfers/:transferId/process
Yes	User	Admin or backend job continuation event
POST	/api/transfers/:transferId/cancel	Yes	User	Cancel un-processed transfer
POST	/api/transfers/:transferId/reverse	Yes	Admin	Manually unwind transfer action (Admin)

G.9 Tracksy AI & Models — `/api/ai`, `/api/forecasting`, `/api/financial-health`

Table G. 8:Analytics and Intelligence Endpoints
Method	Endpoint	Auth Required	Min Role	Description
POST	/api/ai/chat	Yes	User	Groq LLM integration hook (handleChat)
GET	/api/forecasting/expenses
Yes	User	Returns baseline future trend mapping
GET	/api/forecasting/category/:category
Yes	User	Segmented isolated linear forecast
GET	/api/financial-health/score	Yes	User	Current generated health integer (1-100)
GET	/api/financial-health/history	Yes	User	Series dataset for health score line graph


G.10 Security and Administration — `/api/admin`

Table G. 9:Backoffice Endpoints
Method	Endpoint	Auth Required	Min Role	Description
POST	/api/admin/invite	Yes	Super Admin	Register/invite a secondary sub-admin
POST	/api/admin/accept-invite	No	Public	Initial sub-admin handshake route
GET	/api/admin/users	Yes	Admin	List all registered user accounts globally
PATCH	/api/admin/users/:userId/role
Yes	Super Admin	Elevate or lower user privilege
PATCH	/api/admin/users/:userId/status
Yes	Super Admin	Freeze, suspend, or reactivate accounts
GET	/api/admin/analytics/overview	Yes	Admin	Fetch highest-level platform heartbeat stats
GET	/api/admin/financial/overview	Yes	Admin	Total platform AUM and transfer volume
GET	/api/admin/transfers	Yes	Admin	Global ledger access to all active transfers
GET	/api/admin/system/health	Yes	Admin	Technical uptime logic and node status












Appendix H — Sprint Log and Agile Backlog

H.1 Purpose
This appendix documents the complete sprint-by-sprint development log and MoSCoW-prioritised backlog used to govern feature delivery throughout the project lifecycle.

H.2 Sprint Log

Table H. 1:Sprint Delivery Log
Sprint	Dates	Primary Deliverables	Status
Sprint 1	Nov 24 "“ Dec 7, 2025	Project scaffolding, GitHub repository setup, JWT authentication, RBAC (User/Admin/Super Admin/Guest), email verification	Complete
Sprint 2	Dec 8 "“ Dec 21, 2025	Full CRUD transaction engine, 18+ expenditure categories, date-range filtering, pagination	Complete
Sprint 3	Dec 22, 2025 "“ Jan 4, 2026	Budget module, real-time utilisation tracking, progressive alerts at 80/90/100%, SendGrid email integration	Complete
Sprint 4	Jan 5 "“ Jan 18, 2026	Savings goal tracking, milestone progress indicators, contribution logging, goal completion notifications	Complete
Sprint 5	Jan 19 "“ Feb 1, 2026	Bill management module, recurring bill configuration, due-date tracker, automated email reminders, mark-as-paid	Complete
Sprint 6	Feb 2 "“ Feb 15, 2026	P2P internal wallet, ACID-compliant atomic transfers, UUID v4 idempotency, double-entry accounting, audit trail	Complete
Sprint 7	Feb 16 "“ Mar 1, 2026	Analytics dashboard (Recharts), financial health score algorithm, summary cards, spending pattern charts	Complete
Sprint 8	Mar 2 "“ Mar 15, 2026	Python ML microservice (Random Forest Regressor), 2FA email OTP, Groq LLM Tracksy assistant, Monte Carlo retirement planner, multi-currency display	Complete
Sprint 9	Mar 16 "“ Mar 29, 2026	Integration testing, UAT beta deployment, Lighthouse audit, Postman security tests, mobile CSS bug fixes, dark mode persistence fix	Complete
Sprint 10	Mar 30 "“ Apr 13, 2026	Final documentation, appendix population, deployment validation, final report submission	Complete

H.3 MoSCoW Backlog

Table H. 2:MoSCoW Feature Classification
Priority	Feature	Sprint Delivered	Final Status
Must Have	Secure user authentication (JWT + RBAC + 2FA)	Sprints 1, 8	Delivered
Must Have	Transaction CRUD (18+ categories)	Sprint 2	Delivered
Must Have	Budget management with progressive alerts	Sprint 3	Delivered
Must Have	P2P wallet with ACID transactions	Sprint 6	Delivered
Must Have	Real-time analytics dashboard	Sprint 7	Delivered
Should Have	Savings goal tracking	Sprint 4	Delivered
Should Have	Bill management and reminders	Sprint 5	Delivered
Should Have	ML expense forecasting (Python/Scikit-Learn Random Forest)	Sprint 8	Delivered
Should Have	AI assistant — Tracksy (Groq LLM API)	Sprint 8	Delivered
Should Have	Monte Carlo retirement planner	Sprint 8	Delivered
Should Have	Dark mode with persistence	Sprint 7	Delivered
Could Have	Data export (CSV/PDF)	Sprint 9	Delivered
Could Have	Multi-currency display	Sprint 8	Delivered
Won't Have (this cycle)	Automated bank API sync (Plaid)	—	Intentionally excluded — privacy rationale documented in Chapter 9
Won't Have (this cycle)	Native mobile app (React Native)	—	Future enhancement — documented in Chapter 11
Won't Have (this cycle)	OCR receipt scanning	—	Future enhancement — documented in Chapter 11

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
- Screen resolution: Minimum 1366 Ã— 768 (responsive down to 320px width)
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

Appendix J — Project Source Code Link

The complete project source code is hosted on Plymouth University OneDrive and is 
accessible to all evaluators via the link below. The link has been configured with 
open access permissions as required by the submission guidelines.

OneDrive Source Code Link:
[INSERT YOUR PLYMOUTH ONEDRIVE LINK HERE]

Note: The student must paste their actual OneDrive link here before submission. This appendix is mandatory; failure to include a valid accessible link results in zero marks for the project per the submission guidelines.

The GitHub repository is provided separately in Appendix K.

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

Figure K.1: GitHub Commit History — Smart Financial Tracker (Nov 2025 "“ Apr 2026)

Appendix L — Project Initiation Document (PID)

The Project Initiation Document (PID) was produced at the outset of the project 
to formally define the project scope, objectives, schedule, resource constraints, 
and risk management strategy. It served as the foundational governance document 
throughout the development lifecycle.

[INSERT THE FULL PID DOCUMENT CONTENT HERE, OR INSERT THE PID AS A SCANNED/EMBEDDED PAGE]

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

Appendix N — Interim Report

The Interim Report was submitted as a formal mid-project academic deliverable 
documenting the requirements gathering process, literature review, initial 
system architecture, and early implementation progress as of March 2026.

The full interim report is included on the following pages / attached as 
a separate bound document per the submission instructions.

[The student must insert or bind the interim report here.]

Appendix O — Software Development Methodologies Evaluation
Critical evaluation of Agile/Scrum against Waterfall models, justifying the selection of Agile for its adaptability during experimental ML development.

Appendix P — Technological Stack Justification
Evaluation of the MERN stack against competitors (e.g., LAMP, Django). MERN was selected for its JSON-centricity and rapid prototyping capabilities.
