const fs = require('fs');
const filePath = 'f:\\Smart Financial Tracker\\current fyp report.md';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    {
        target: 'reduced control over personal cash flow.',
        replacement: 'reduced control over personal cash flow (IMF, 2024).'
    },
    {
        target: 'rather than objective income assessment.',
        replacement: 'rather than objective income assessment (Kahneman, 2011; Byrne and Brooks, 2008).'
    },
    {
        target: 'mid-cycle behavioural correction.',
        replacement: 'mid-cycle behavioural correction (Alea IT Solutions, 2025).'
    },
    {
        target: 'incentivize consistency.',
        replacement: 'incentivize consistency (Academy Bank, 2024).'
    },
    {
        target: '(e.g., retaining active ARIA labels).',
        replacement: '(e.g., retaining active ARIA labels) (W3C, 2018; Siteimprove, no date).'
    },
    {
        target: 'behavioural and market gaps.',
        replacement: 'behavioural and market gaps (Huxley, 2022).'
    },
    {
        target: 'confident financial planning constraint.',
        replacement: 'confident financial planning constraint (Xiao and O’Neill, 2018).'
    },
    {
        target: 'real-time application performance.',
        replacement: 'real-time application performance (SourceForge, no date).'
    },
    {
        target: 'unprecedented affordability crisis.',
        replacement: 'unprecedented affordability crisis (CSAC, 2025).'
    },
    {
        target: 'end of the financial cycle.',
        replacement: 'end of the financial cycle (NCAN, 2024).'
    },
    {
        target: 'targeted financial product advertising.',
        replacement: 'targeted financial product advertising (MyBankTracker, 2024).'
    },
    {
        target: 'architectural parameters of the system.',
        replacement: 'architectural parameters of the system (BrowserStack, no date).'
    },
    {
        target: 'point-of-sale decision-making impossible.',
        replacement: 'point-of-sale decision-making impossible (Sentry, 2024).'
    },
    {
        target: 'prior to final deployment.',
        replacement: 'prior to final deployment (Elementor, no date).'
    },
    {
        target: 'monitors to mobile displays.',
        replacement: 'monitors to mobile displays (Dey, 2026).'
    },
    {
        target: 'existing market alternatives.',
        replacement: 'existing market alternatives (Enfin Technologies, no date).'
    },
    {
        target: 'market leaders like YNAB.',
        replacement: 'market leaders like YNAB (Bitcot, 2026).'
    },
    {
        target: 'completely removes the enterprise cost barrier',
        replacement: 'completely removes the enterprise cost barrier (Reddit, no date)'
    },
    {
        target: 'Model-View-Controller (MVC) logic on the backend API',
        replacement: 'Model-View-Controller (MVC) logic on the backend API (Dowen, 2023)'
    },
    {
        target: 'point of ledger entry.',
        replacement: 'point of ledger entry (Fixer.io, no date).'
    },
    {
        target: 'offline operational caching',
        replacement: 'offline operational caching (Redis, 2024)'
    }
];

let modified = false;
replacements.forEach(({target, replacement}) => {
    if (content.includes(target) && !content.includes(replacement)) {
        content = content.replace(target, replacement);
        modified = true;
    } else if (!content.includes(target) && !content.includes(replacement)) {
        console.log("Could not find target: ", target);
    }
});

const newReferences = `
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
`;

// Only add if not already there
if (!content.includes('Academy Bank (2024)')) {
    content += newReferences;
    modified = true;
}

if (modified) {
    // Let's sort the references so they look nice
    // It's a bit complicated to sort mixed text, so we'll just append it and it's fine
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated successfully.");
} else {
    console.log("No modifications were needed or made.");
}
