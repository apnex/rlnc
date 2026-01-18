/**
 * ALPHAv7 Changelog Renderer
 * Usage: node scripts/render_changelog.js
 */

const fs = require('fs');
const path = require('path');

// Load Data
const jsonPath = path.join(__dirname, '../docs/v7_changelog.json');
let data;

try {
    const raw = fs.readFileSync(jsonPath);
    data = JSON.parse(raw);
} catch (e) {
    console.error("❌ Error: Could not load docs/v7_changelog.json");
    process.exit(1);
}

// Helper for Feature Tables
function printTable(changes) {
    let output = `| Feature / Optimization | Technical Detail | Purpose |\n`;
    output += `| :--- | :--- | :--- |\n`;
    
    changes.forEach(c => {
        output += `| **${c.feature}** | ${c.detail} | ${c.purpose} |\n`;
    });
    return output;
}

// Generate Markdown Header
let md = `### ⚙️ v7 Core Engineering Changelog
**Version Tag:** \`${data.version}\`
**Focus:** ${data.focus}
**Date:** ${data.date}

---
`;

// Render File Sections
data.files.forEach(file => {
    md += `\n### 📂 File: \`${file.name}\`
**Status:** ${file.status}

${printTable(file.changes)}
---`;
});

// Render Performance Summary as a Table
const p = data.performance_impact;
md += `\n### 📊 Performance Impact Summary
Comparing **v6 Baseline** vs. **v7 Current**:

| Metric | v6 Baseline | v7 Current | Gain |
| :--- | :--- | :--- | :--- |
| **Systematic Throughput** | ${p.systematic_throughput.before} | **${p.systematic_throughput.after}** | ${p.systematic_throughput.gain} |
| **Heavy Math Throughput** | ${p.heavy_math_throughput.before} | **${p.heavy_math_throughput.after}** | ${p.heavy_math_throughput.gain} |
| **Latency (Systematic)** | ${p.latency.before} | **${p.latency.after}** | N/A |
`;

console.log(md);
