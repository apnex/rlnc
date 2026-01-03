const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitState() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim() === '' ? 'Clean' : 'Dirty';
    } catch (e) {
        return 'Unknown';
    }
}

function generateStatus() {
    const changelog = JSON.parse(fs.readFileSync(path.join(__dirname, 'changelog.json'), 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'status_metadata.json'), 'utf8'));
    const protocols = JSON.parse(fs.readFileSync(path.join(__dirname, 'protocols.json'), 'utf8'));

    const latestVersion = changelog.changelog[0].version;
    const gitState = getGitState();

    const statusReport = {
        project: "Alpha-v8 Velocity",
        version: latestVersion,
        environment: {
            git_state: gitState,
            active_baseline: protocols.system_manifest.active_baseline
        },
        capabilities: metadata.key_capabilities,
        modules: metadata.module_overview,
        technical_debt: metadata.technical_debt,
        active_protocols: protocols.system_manifest.registry_index,
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync(path.join(__dirname, 'status.json'), JSON.stringify(statusReport, null, 2));
    console.log("[System] STAT_V1: status.json successfully synthesized.");
}

generateStatus();
