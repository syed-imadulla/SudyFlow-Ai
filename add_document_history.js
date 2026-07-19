const fs = require('fs');
const path = require('path');

const brainDir = path.join(__dirname, 'docs/brain');
const files = fs.readdirSync(brainDir).filter(f => f.endsWith('.md'));

const historySection = `
## Document History
| Version | Date | Summary of Changes |
|---|---|---|
| 1.0.0 | 2026-07-19 | Initial creation of Project Brain documentation. |
`;

for (const file of files) {
  const filePath = path.join(brainDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('## Document History')) continue;

  const footerIndex = content.lastIndexOf('\n---');
  if (footerIndex !== -1) {
    content = content.slice(0, footerIndex) + '\n' + historySection + content.slice(footerIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
