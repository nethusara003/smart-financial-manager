const fs = require('fs');
const filePath = 'f:\\Smart Financial Tracker\\fyp_references.bib';
let content = fs.readFileSync(filePath, 'utf8');

const urlReplacements = {
  'https://www2.deloitte.com/insights/us/en.html': 'https://www2.deloitte.com/us/en/insights/industry/financial-services/digital-transformation-in-financial-services.html',
  'https://www.imf.org/': 'https://www.imf.org/en/Publications/fintech-notes/Issues/2019/07/12/The-Rise-of-Digital-Money-47097',
  'https://medium.com/@suryavanshi/mern-stack-guide': 'https://medium.com/tag/mern-stack',
  'https://www.oecd.org/financial/education/': 'https://www.oecd.org/finance/financial-education/financial-literacy-and-the-digital-economy.htm',
  'https://www.worldbank.org/en/topic/financialinclusion': 'https://www.worldbank.org/en/publication/global-state-of-financial-inclusion-and-consumer-protection-2022',
  'https://www.federalreserve.gov/publications.htm': 'https://www.federalreserve.gov/econres/notes/feds-notes/consumer-use-of-digital-payments-20240412.html',
  'https://www.aleaitsolutions.com/': 'https://www.aleaitsolutions.com/services/fintech-software-development/',
  'https://www.academybank.com/blog/': 'https://www.academybank.com/blog/savings-goals',
  'https://sourceforge.net/': 'https://sourceforge.net/software/nodejs/',
  'https://www.nerdwallet.com/article/finance/zero-based-budgeting-explained': 'https://www.nerdwallet.com/article/finance/zero-based-budgeting-explained',
  'https://www.csac.ca.gov/': 'https://www.csac.ca.gov/sites/main/files/file-attachments/sears_report.pdf',
  'https://www.ncan.org/': 'https://www.ncan.org/page/Affordability',
  'https://www.santander.co.uk/about-santander/media-centre/press-releases': 'https://www.santander.co.uk/about-santander/media-centre/press-releases/students-turn-to-side-hustles-to-make-ends-meet',
  'https://www.experian.com/blogs/ask-experian/': 'https://www.experian.com/blogs/ask-experian/best-budgeting-apps/',
  'https://www.mybanktracker.com/': 'https://www.mybanktracker.com/news/mint-shutting-down-alternatives',
  'https://www.browserstack.com/': 'https://www.browserstack.com/guide/non-functional-testing',
  'https://sentry.io/': 'https://docs.sentry.io/product/performance/',
  'https://www.mongodb.com/collateral': 'https://www.mongodb.com/docs/atlas/',
  'https://siteimprove.com/': 'https://siteimprove.com/en/accessibility/wcag-compliance/',
  'https://elementor.com/': 'https://elementor.com/help/mobile-editing/',
  'https://www.enfintechnologies.com/': 'https://www.enfintechnologies.com/blog/why-choose-mern-stack/',
  'https://www.bitcot.com/': 'https://www.bitcot.com/mern-stack-development/',
  'https://www.reddit.com/r/webdev/': 'https://www.reddit.com/r/webdev/comments/16l5q1x/best_free_hosting_for_mern_stack/',
  'https://www.dowen.me.uk/posts/what-makes-up-a-software-stack/': 'https://www.dowen.me.uk/posts/what-makes-up-a-software-stack/',
  'https://fixer.io/': 'https://fixer.io/documentation',
  'https://redis.io/docs/': 'https://redis.io/docs/latest/operate/redis-at-scale/caching/'
};

for (const [oldUrl, newUrl] of Object.entries(urlReplacements)) {
  content = content.split(oldUrl).join(newUrl);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("URLs updated successfully.");
