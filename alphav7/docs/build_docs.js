const fs = require('fs');

/**
 * Renders the high-level project status
 */
function renderStatus(data) {
    let md = `# 🚀 ${data.project}\n\n`;
    md += `**Current State:** \`${data.current_state}\`\n\n`;
    md += `### Description\n${data.description}\n\n`;
    md += `### Purpose\n${data.purpose}\n\n`;
    md += `### Key Features\n`;
    
    data.key_features.forEach(f => {
        md += `* **${f.feature}**: ${f.detail}\n`;
    });
    
    return md + `\n---\n\n`;
}

/**
 * Renders the interactive command table
 */
function renderCommands(data) {
    let md = `## 🛠️ User-Defined Commands\n\n`;
    md += `| Command | Description | Purpose | Instruction |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    data.defined_commands.forEach(cmd => {
        const instruction = cmd.instruction.replace(/\|/g, '\\|');
        md += `| **\`${cmd.command}\`** | ${cmd.description} | ${cmd.purpose} | ${instruction} |\n`;
    });

    return md;
}

try {
    // Reading from the current working directory
    const statusData = JSON.parse(fs.readFileSync('./status.json', 'utf8'));
    const commandData = JSON.parse(fs.readFileSync('./commands.json', 'utf8'));

    const content = renderStatus(statusData) + renderCommands(commandData);

    // Writing to the current working directory
    fs.writeFileSync('./README.md', content);
    console.log("✅ README.md generated in the current directory.");
} catch (err) {
    console.error("❌ Build failed. Ensure status.json and commands.json exist here:", err.message);
}
