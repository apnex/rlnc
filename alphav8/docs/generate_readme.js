const fs = require('fs');
const path = require('path');

// DOC_V1 Verification Check
const requiredFiles = [
    path.join(__dirname, './status.json'),
    path.join(__dirname, './protocols.json'),
    path.join(__dirname, './changelog.json'),
    path.join(__dirname, './roadmap.json'),
    path.join(__dirname, './refactor_matrix.json')
];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.error(`[DOC_V1 Error] Missing required data sources: ${missingFiles.join(', ')}`);
    process.exit(1);
}

// Load Data Sources
const status = JSON.parse(fs.readFileSync(path.join(__dirname, './status.json'), 'utf8'));
const protocols = JSON.parse(fs.readFileSync(path.join(__dirname, './protocols.json'), 'utf8'));
const history = JSON.parse(fs.readFileSync(path.join(__dirname, './changelog.json'), 'utf8'));
const roadmap = JSON.parse(fs.readFileSync(path.join(__dirname, './roadmap.json'), 'utf8'));
const matrix = JSON.parse(fs.readFileSync(path.join(__dirname, './refactor_matrix.json'), 'utf8'));

const readmeContent = `
# ${status.project} - v${status.version}
**Status:** ${status.environment.git_state === 'Clean' ? 'Stable' : 'In-Progress (Dirty)'}  
**Active Baseline:** ${status.environment.active_baseline}

## 🚀 One-Sentence Bootstrap
> "You are the Engineer in this session. Your first task is to read protocols.json. Follow ONBOARD_V2 to bootstrap."

## 🛠 Key Capabilities
${status.capabilities.map(c => `- **${c.feature}:** ${c.detail}`).join('\n')}

## 📜 Active Protocols
Operated under the **DOC_V1** automated standard:

| ID | Protocol Name | Version |
|:---|:---|:---|
${Object.entries(protocols.protocol_library).map(([id, p]) => `| **${id}** | ${p.protocol_name} | v${p.version} |`).join('\n')}

## 🏗 Roadmap
| Milestone | Detail | Status |
|:---|:---|:---|
${roadmap.strategic_roadmap.map(m => `| ${m.title} | ${m.objective} | ${m.status} |`).join('\n')}

## 🧬 Structural Evolution (OPTIMISE)
${matrix.refactors.map(r => `
#### ${r.title}
- **Trigger:** ${r.trigger}
- **SQAs Targeted:** ${r.sqa_targeted.join(', ')}
- **Result:** ${r.result}`).join('\n')}

## ⚠️ Technical Debt
${status.technical_debt.map(d => `- **${d.issue}:** ${d.impact}`).join('\n')}

## 🕒 Version History
${history.changelog.slice(0, 5).map(v => `### v${v.version} (${v.date})\n${v.changes.map(c => `- ${c}`).join('\n')}`).join('\n\n')}

---
*Generated via DOC_V1 Protocol*
`;

fs.writeFileSync(path.join(__dirname, './README.md'), readmeContent.trim());
console.log("[System] DOC_V1: README.md successfully synchronized with JSON sources.");
