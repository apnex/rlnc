const fs = require('fs');
const path = require('path');

const protocolsPath = path.join(__dirname, 'protocols.json');
const outputPath = path.join(__dirname, 'PROTOCOLS.md');

if (!fs.existsSync(protocolsPath)) {
    console.error(`[Error] protocols.json not found at ${protocolsPath}`);
    process.exit(1);
}

const protocols = JSON.parse(fs.readFileSync(protocolsPath, 'utf8'));
const library = protocols.protocol_library;

let md = `# System Protocols Manual\n`;
md += `**Active Baseline:** ${protocols.system_manifest.active_baseline}\n`;
md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
md += `**Authoritative Source:** [protocols.json](./protocols.json)\n\n`;
md += `> This document is the authoritative manual for all active system protocols. It is auto-generated from \`protocols.json\`.\n\n`;

// Table of Contents
md += `## Registry Index\n`;
md += `| ID | Protocol Name | Version |\n`;
md += `|:---|:---|:---|\n`;
md += `${Object.entries(library).map(([id, p]) => `| [**${id}**](#${id.toLowerCase().replace(/_/g, '')}) | ${p.protocol_name} | v${p.version} |`).join('\n')}\n`;

md += `\n---\n`;

// Protocol Details
Object.entries(library).forEach(([id, p]) => {
    md += `## ${id}\n`;
    md += `**Name:** ${p.protocol_name}  
`;
    md += `**Version:** v${p.version}\n\n`;

    // Philosophy / Core Principles
    if (p.philosophy) {
        md += `### Philosophy
> "${p.philosophy}"\n\n`;
    }
    if (p.core_principles) {
        md += `### Core Principles\n`;
        Object.entries(p.core_principles).forEach(([key, val]) => {
            md += `- **${formatKey(key)}:** ${val}\n`;
        });
        md += `\n`;
    }

    // Roles
    if (p.roles) {
        md += `### Roles & Responsibilities\n`;
        Object.entries(p.roles).forEach(([role, def]) => {
            md += `#### ${role} (${def.designation})
`;
            def.responsibilities.forEach(r => md += `- ${r}\n`);
            md += `\n`;
        });
    }

    // Operational Phases (GSD Style)
    if (p.operational_phases) {
        md += `### Operational Phases\n`;
        p.operational_phases.forEach(phase => {
            md += `#### ${phase.id}: ${phase.action}\n`;
            if (phase.description) md += `*${phase.description}*\n\n`;
            if (phase.steps) {
                phase.steps.forEach((step, i) => md += `${i+1}. ${step}\n`);
            }
            md += `\n`;
        });
    }

    // Interaction Standards / Workflows (Generic)
    if (p.interaction_standard) {
        md += `### Interaction Standard\n`;
        Object.entries(p.interaction_standard).forEach(([key, val]) => {
            md += `- **${formatKey(key)}:** ${val}\n`;
        });
        md += `\n`;
    }

    if (p.amendment_workflow) {
        md += `### Amendment Workflow\n`;
        p.amendment_workflow.forEach((step, i) => md += `${i+1}. ${step}\n`);
        md += `\n`;
    }
    
    md += `---\n`;
});

function formatKey(key) {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

fs.writeFileSync(outputPath, md);
console.log(`[Success] Generated PROTOCOLS.md at ${outputPath}`);
