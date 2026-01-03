/**
 * ALPHAv7 Changelog Renderer (Markdown)
 * Usage: node utils/render_changelog.js <path_to_json>
 */

const fs = require('fs');
const path = require('path');

// 1. Load Data from CLI Argument
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("❌ Usage: node utils/render_changelog.js <path_to_json>");
    process.exit(1);
}

const jsonPath = path.resolve(args[0]);
let data;

try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    data = JSON.parse(raw);
} catch (e) {
    console.error(`❌ Error: Could not load ${jsonPath}`);
    console.error(e.message);
    process.exit(1);
}

// 2. Helper for Feature Tables
// Adapted to handle the new JSON structure (type, description, details)
function printTable(changes) {
    let output = `| Type | Feature / Description | Technical Detail |\n`;
    output += `| :--- | :--- | :--- |\n`;
    
    changes.forEach(c => {
        // Map new JSON keys to the table columns
        const type = `\`${c.type || 'UPDATE'}\``;
        const feature = c.description || c.feature;
        const detail = c.details || c.detail || '-';
        
        output += `| ${type} | **${feature}** | ${detail} |\n`;
    });
    return output;
}

// 3. Generate Markdown Header
let md = `### ⚙️ ${data.title || 'v7 Engineering Changelog'}
**Version Tag:** \`${data.version}\`
**Date:** ${data.date}

---
`;

// 4. Render Sections (Handle nested Modules)
if (data.modules) {
    data.modules.forEach(mod => {
        md += `\n## 📦 Module: \`${mod.name}\`\n`;
        
        if (mod.files) {
            mod.files.forEach(file => {
                md += `\n### 📂 File: \`${file.name}\`\n`;
                if (file.status) md += `**Status:** ${file.status}\n\n`;
                
                md += printTable(file.changes);
            });
        }
        md += `\n---\n`;
    });
} 
// Fallback for flat structure (Legacy support)
else if (data.files) {
    data.files.forEach(file => {
        md += `\n### 📂 File: \`${file.name}\`\n`;
        md += printTable(file.changes);
        md += `---\n`;
    });
}

// 5. Render Performance Summary (Conditional)
// Only renders if the JSON actually contains performance data
if (data.performance_impact) {
    const p = data.performance_impact;
    md += `\n### 📊 Performance Impact Summary
Comparing **v6 Baseline** vs. **v7 Current**:

| Metric | v6 Baseline | v7 Current | Gain |
| :--- | :--- | :--- | :--- |
| **Systematic Throughput** | ${p.systematic_throughput.before} | **${p.systematic_throughput.after}** | ${p.systematic_throughput.gain} |
| **Heavy Math Throughput** | ${p.heavy_math_throughput.before} | **${p.heavy_math_throughput.after}** | ${p.heavy_math_throughput.gain} |
| **Latency** | ${p.latency.before} | **${p.latency.after}** | N/A |
`;
}

console.log(md);
