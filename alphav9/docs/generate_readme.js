const fs = require('fs');
const path = require('path');
const { SOURCES, TARGETS } = require('../tools/path_resolver');

// DOC_V1 Verification Check
const requiredFiles = Object.values(SOURCES);
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.error(`[DOC_V1 Error] Missing required data sources: ${missingFiles.join(', ')}`);
    process.exit(1);
}

// Load Data Sources
const status = JSON.parse(fs.readFileSync(SOURCES.STATUS, 'utf8'));
const protocols = JSON.parse(fs.readFileSync(SOURCES.PROTOCOLS, 'utf8'));
const history = JSON.parse(fs.readFileSync(SOURCES.CHANGELOG, 'utf8'));
const roadmap = JSON.parse(fs.readFileSync(SOURCES.ROADMAP, 'utf8'));
const matrix = JSON.parse(fs.readFileSync(SOURCES.REFACTOR_MATRIX, 'utf8'));

const readmeContent = `
# ${status.project} - v${status.version}
**Status:** ${status.environment.git_state === 'Clean' ? 'Stable' : 'In-Progress (Dirty)'}  
**Active Baseline:** ${status.environment.active_baseline}

## 🛠 Key Capabilities
${status.capabilities.map(c => `- **${c.feature}:** ${c.detail}`).join('\n')}

## 🏗 Roadmap
${roadmap.objectives.map(m => `
#### ${m.title} [${m.status}]
- **Domain:** ${m.domain}
- **Description:** ${m.description}
- **SQA Anchors:** ${m.sqa_anchors.join(', ')}
- **Goal:** ${m.goal}`).join('\n')}

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

fs.writeFileSync(TARGETS.README, readmeContent.trim());
console.log("[System] DOC_V1: README.md successfully synchronized with JSON sources.");