const fs = require('fs');
const path = require('path');

const brainDir = path.join(__dirname, 'docs/brain');

const files = fs.readdirSync(brainDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(brainDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract related documents
  let relatedDocs = '';
  const relatedMatch = content.match(/\*\*Related Documents\*\*:\s*(.*)/);
  if (relatedMatch) {
    relatedDocs = relatedMatch[1];
  }

  // Find the header section
  const titleMatch = content.match(/^(#\s+.*?\n)/);
  if (!titleMatch) continue;

  const headerEndIndex = content.indexOf('\n---', titleMatch[0].length);
  if (headerEndIndex === -1) continue;

  const newHeader = `
**Project Brain Version**: 1.1
**Document Version**: 1.0.0
**Last Updated**: 2026-07-19
**Last Verified Against Code**: 2026-07-19
**Current Phase**: Phase 2
**Current Milestone**: Milestone 2.2
**Related Documents**: ${relatedDocs || 'None'}
`;

  const newContent = content.substring(0, titleMatch[0].length) + newHeader + content.substring(headerEndIndex);
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated ${file}`);
}
