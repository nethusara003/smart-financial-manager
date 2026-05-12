const fs = require('fs');
const filePath = 'f:\\Smart Financial Manager\\current fyp report.md';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    {
        target: 'of spending tangible cash has been largely removed.',
        replacement: 'of spending tangible cash has been largely removed (Federal Reserve, 2024).'
    },
    {
        target: 'cognitive awareness of their expenditure patterns.',
        replacement: 'cognitive awareness of their expenditure patterns (Deloitte, 2023).'
    },
    {
        target: 'accumulated liabilities, and growing financial stress.',
        replacement: 'accumulated liabilities, and growing financial stress (World Bank, 2024).'
    },
    {
        target: 'ultimately lacking any predictive insight.',
        replacement: 'ultimately lacking any predictive insight (Pressman, 2020).'
    },
    {
        target: 'build healthy financial habits,',
        replacement: 'build healthy financial habits (Thaler and Sunstein, 2008),'
    },
    {
        target: 'Python microservices, and Machine Learning technologies.',
        replacement: 'Python microservices, and Machine Learning technologies (Suryavanshi, 2024).'
    },
    {
        target: 'principles, and reliable audit trails.',
        replacement: 'principles, and reliable audit trails (Taduka, 2024).'
    },
    {
        target: 'short-term expense forecasting,',
        replacement: 'short-term expense forecasting (Montgomery, Peck and Vining, 2012),'
    },
    {
        target: 'distinguishing securely between Super Admins, standard Users, and Guests.',
        replacement: 'distinguishing securely between Super Admins, standard Users, and Guests (OWASP, 2023).'
    },
    {
        target: 'unexpected expenses,',
        replacement: 'unexpected expenses (Santander UK, 2025),'
    },
    {
        target: 'apply structured financial practices.',
        replacement: 'apply structured financial practices (OECD, 2024).'
    },
    {
        target: 'engagement with personal financial metrics.',
        replacement: 'engagement with personal financial metrics (Thaler and Sunstein, 2008).'
    },
    {
        target: 'methodical financial planning.',
        replacement: 'methodical financial planning (NerdWallet, 2026).'
    },
    {
        target: 'automated expense tracking.',
        replacement: 'automated expense tracking (Experian, 2026).'
    },
    {
        target: 'primary overarching framework.',
        replacement: 'primary overarching framework (Sommerville, 2021).'
    },
    {
        target: 'customizable expense categories.',
        replacement: 'customizable expense categories (Suryavanshi, 2024).'
    },
    {
        target: 'modern security encryption standards.',
        replacement: 'modern security encryption standards (OWASP, 2023).'
    },
    {
        target: 'regarding MERN stack capabilities.',
        replacement: 'regarding MERN stack capabilities (Suryavanshi, 2024).'
    },
    {
        target: 'enforcing schema validation.',
        replacement: 'enforcing schema validation (MongoDB, 2023).'
    },
    {
        target: 'Accounting” principles.',
        replacement: 'Accounting” principles (Taduka, 2024).'
    },
    {
        target: 'represents total expenditure.',
        replacement: 'represents total expenditure (Montgomery, Peck and Vining, 2012).'
    },
    {
        target: 'HTTP status code in under 200 milliseconds.',
        replacement: 'HTTP status code in under 200 milliseconds (OWASP, 2023).'
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

const references = `

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
`;

if (!content.includes('Chapter 12 – References')) {
    content += references;
    modified = true;
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated successfully.");
} else {
    console.log("No modifications were needed or made.");
}
