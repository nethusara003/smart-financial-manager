const fs = require('fs');
const path = 'f:/Smart Financial Manager/frontend/src/index.css';

let content = fs.readFileSync(path, 'utf8');

// The file might contain null bytes (from UTF-16 echo)
content = content.replace(/\0/g, '');

// Find the last actual rule we know
const lastValidRule = 'html:not(.dark) [class*="from-indigo-900"] { --tw-gradient-from: rgba(49,46,129,0.05) !important; }';
const idx = content.indexOf(lastValidRule);

if (idx !== -1) {
  content = content.substring(0, idx + lastValidRule.length);
  
  // Append our new styles
  content += `\n
/* Force text inside modals to be readable in light mode */
html:not(.dark) [role="dialog"] *,
html:not(.dark) .modal *,
html:not(.dark) [class*="modal"] * {
  --tw-text-opacity: 1 !important;
}

html:not(.dark) [role="dialog"] .text-white,
html:not(.dark) .modal .text-white,
html:not(.dark) [class*="modal"] .text-white,
html:not(.dark) [role="dialog"] .text-gray-100,
html:not(.dark) .modal .text-gray-100,
html:not(.dark) [class*="modal"] .text-gray-100,
html:not(.dark) [role="dialog"] .text-gray-200,
html:not(.dark) .modal .text-gray-200,
html:not(.dark) [class*="modal"] .text-gray-200 {
  color: #0f172a !important;
}

html:not(.dark) [role="dialog"] .text-gray-300,
html:not(.dark) .modal .text-gray-300,
html:not(.dark) [class*="modal"] .text-gray-300,
html:not(.dark) [role="dialog"] .text-gray-400,
html:not(.dark) .modal .text-gray-400,
html:not(.dark) [class*="modal"] .text-gray-400 {
  color: #475569 !important;
}
`;
  
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully cleaned and updated index.css");
} else {
  console.log("Could not find the anchor point in index.css");
}
