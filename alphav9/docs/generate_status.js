const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { SOURCES } = require('../tools/path_resolver');

function getGitState() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim() === '' ? 'Clean' : 'Dirty';
    } catch (e) {
        return 'Unknown';
    }
}

function generateStatus() {
    const changelog = JSON.parse(fs.readFileSync(SOURCES.CHANGELOG, 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(SOURCES.METADATA, 'utf8'));
    const protocols = JSON.parse(fs.readFileSync(SOURCES.PROTOCOLS, 'utf8'));

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
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync(SOURCES.STATUS, JSON.stringify(statusReport, null, 2));
    console.log("[System] STAT_V1: status.json successfully synthesized.");
}

generateStatus();