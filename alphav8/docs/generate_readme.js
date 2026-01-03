const fs = require('fs');
const path = require('path');

// DOC_V1 Verification Check
const requiredFiles = [
    path.join(__dirname, './readme_data.json'),
    path.join(__dirname, './protocols.json'),
    path.join(__dirname, './changelog.json')
];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.error(`[DOC_V1 Error] Missing required data sources: ${missingFiles.join(', ')}`);
    process.exit(1);
}

// Load Data Sources
const data = JSON.parse(fs.readFileSync(path.join(__dirname, './readme_data.json'), 'utf8'));
const protocols = JSON.parse(fs.readFileSync(path.join(__dirname, './protocols.json'), 'utf8'));
const history = JSON.parse(fs.readFileSync(path.join(__dirname, './changelog.json'), 'utf8'));

const readmeContent = `
# ${data.engine_name} - v${data.version}
**Status:** ${data.status}  

## 🚀 One-Sentence Bootstrap
> "You are the Engineer in this session. Your first task is to read protocols.json. Follow ONBOARD_V1 to bootstrap."

## 📜 Active Protocols
Operated under the **DOC_V1** automated standard:

| ID | Protocol Name | Version |
|:---|:---|:---|
${Object.entries(protocols.protocol_library).map(([id, p]) => `| **${id}** | ${p.protocol_name} | v${p.version} |`).join('\n')}

## 📊 Performance Baselines
| ID | Test Name | Environment | Result | Status |
|:---|:---|:---|:---|:---|
${data.benchmarks.map(b => `| ${b.id} | ${b.name} | ${b.metrics} | ${b.result} | ${b.status} |`).join('\n')}

## 🏗 Roadmap
- [ ] **Next Milestone:** ${data.active_focus}

## 🕒 Version History
${history.changelog.map(v => `### v${v.version} (${v.date})\n${v.changes.map(c => `- ${c}`).join('\n')}`).join('\n\n')}

---
*Generated via DOC_V1 Protocol*
`;

fs.writeFileSync(path.join(__dirname, './README.md'), readmeContent.trim());
console.log("[System] DOC_V1: README.md successfully synchronized with JSON sources.");
