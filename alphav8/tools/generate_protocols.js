const fs = require('fs');
const path = require('path');
const { SOURCES, TARGETS } = require('./path_resolver');

if (!fs.existsSync(SOURCES.PROTOCOLS)) {
    console.error(`[Error] protocols.json not found at ${SOURCES.PROTOCOLS}`);
    process.exit(1);
}

const protocols = JSON.parse(fs.readFileSync(SOURCES.PROTOCOLS, 'utf8'));
const library = protocols.protocol_library;

let md = `# System Protocol Library\n
`;
md += `**Active Baseline:** ${protocols.system_manifest.active_baseline}\n`;
md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

md += `## 🚀 Bootstrap\n`;
md += `\`\`\`\nYou are the Engineer in this session.\nTo initialize the environment and protocols, execute:\nnode tools/onboard.js\n\`\`\`\n\n`;

md += `**Authoritative Source:** [protocols.json](./protocols.json)\n\n`;
md += `> This document is the authoritative manual for all active system protocols. It is auto-generated from 
protocols.json

`;

md += `## Registry Index\n`
md += `| ID | Protocol Name | Version |\n`
md += `|:---|:---|:---|
`
md += `${Object.entries(library).map(([id, p]) => `| [**${id}**](#${id.toLowerCase().replace(/_/g, '')}) | ${p.protocol_name} | v${p.version} |`).join('\n')}
`

md += `\n---\n\n`;

// --- Deliverable Registry ---
    if (protocols.deliverable_registry) {
        md += `## 📦 Deliverable Registry\n`;
        md += `> This registry is the authoritative glossary for all system outputs. References in protocols are prefixed with **DLR_**.\n\n`;
        protocols.deliverable_registry.forEach(dlr => {
            md += `### <a name="${dlr.id.toLowerCase()}"></a>${dlr.id}\n`;
            md += `- **Name:** ${dlr.name}\n`;
            md += `- **Description:** ${dlr.description}\n`;
            md += `- **Purpose:** ${dlr.purpose}\n`;
            md += `- **Scope:** ${dlr.scope}\n`;
            md += `- **Persistence:** ${dlr.persistence}\n`;
            if (dlr.confidence_weight) md += `- **Confidence Weight:** ${dlr.confidence_weight}\n`;
            md += `\n`;
        });
        md += `\n---\n\n`;
    }

    // --- Compliance Registry ---
    if (protocols.compliance_registry) {
        md += `## ⚖️ Compliance Framework\n`;
        md += `> This registry defines the specific constraints that must be satisfied for an engineering cycle to be verified.\n\n`;
        md += `| ID | Protocol | Constraint | Verification |\n`;
        md += `|:---|:---|:---|:---|\n`;
        protocols.compliance_registry.forEach(cmp => {
            md += `| <a name="${cmp.id.toLowerCase()}"></a>**${cmp.id}** | ${cmp.protocol} | ${cmp.constraint} | ${cmp.verification} |\n`;
        });
        md += `\n---\n\n`;
    }

    const hyperlinkDLR = (text) => {
        return text.replace(/((DLR|CMP)_[A-Z0-9_]+)/g, (match) => {
            return `[${match}](#${match.toLowerCase()})`;
        });
    };

    Object.entries(library).forEach(([id, p]) => {
        md += `## ${id}\n`
        md += `**Name:** ${p.protocol_name}  
`
        md += `**Version:** v${p.version}\n\n`

        if (p.philosophy) {
            md += `### Philosophy\n> "${p.philosophy}"\n\n`
        }
        if (p.principles) {
            md += `### Principles\n`
            p.principles.forEach(principle => md += `- ${hyperlinkDLR(principle)}\n`)
            md += `\n`
        }

        if (p.operational_workflow) {
            md += `### Operational Workflow\n`
            p.operational_workflow.forEach(step => {
                md += `#### ${step.id}: ${step.action}\n`
                if (step.description) md += `*${hyperlinkDLR(step.description)}*\n\n`
                if (step.steps) {
                    step.steps.forEach((s, i) => md += `${i+1}. ${hyperlinkDLR(s)}\n`)
                }
                if (step.gate) md += `\n**GATE:** ${hyperlinkDLR(step.gate)}\n`
                md += `\n`
            })
        }

        if (p.interaction_standard) {
            md += `### Interaction Standard\n`
            Object.entries(p.interaction_standard).forEach(([key, val]) => {
                const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                if (key.endsWith('_standard') && Array.isArray(val) && val.length > 0) {
                    md += `#### ${label}\n`;
                    const headers = Object.keys(val[0]);
                    md += `| ${headers.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(' | ')} |\n`;
                    md += `| ${headers.map(() => ':---').join(' | ')} |\n`;
                    val.forEach(row => {
                        md += `| ${headers.map(h => hyperlinkDLR(String(row[h]))).join(' | ')} |\n`;
                    });
                    md += `\n`;
                } else {
                    md += `- **${label}:** ${hyperlinkDLR(String(val))}\n`;
                }
            })
            md += `\n`
        }
        
        md += `---\n`
    })

// --- Governance Evolution History ---
if (fs.existsSync(SOURCES.GOVERNANCE_CHANGELOG)) {
    const govHistory = JSON.parse(fs.readFileSync(SOURCES.GOVERNANCE_CHANGELOG, 'utf8'));
    md += `## 🕒 Governance Evolution\n\n`;
    govHistory.governance_changelog.forEach(entry => {
        md += `### v${entry.version} (${entry.date})\n`;
        entry.changes.forEach(change => md += `- ${change}\n`);
        md += `\n`;
    });
    md += `---\n*Generated via DOC_V1 Protocol*\n`;
}

fs.writeFileSync(TARGETS.PROTOCOLS_MD, md);
console.log(`[Success] Generated PROTOCOLS.md at ${TARGETS.PROTOCOLS_MD}`);