const fs = require('fs');
const path = require('path');
const { SOURCES } = require('../tools/path_resolver');

function generateStatus() {
    const changelog = JSON.parse(fs.readFileSync(SOURCES.CHANGELOG, 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(SOURCES.METADATA, 'utf8'));
    const protocols = JSON.parse(fs.readFileSync(SOURCES.PROTOCOLS, 'utf8'));

    const latestVersion = changelog.changelog[0].version;

    const statusReport = {
        project: protocols.meta.title,
        version: latestVersion,
        environment: {
            active_baseline: protocols.meta.title + ' (v' + protocols.meta.version + ')'
        },
        capabilities: metadata.key_capabilities,
        modules: metadata.module_overview,
        technical_debt: metadata.technical_debt,
        last_updated: new Date().toISOString()
    };

    fs.writeFileSync(SOURCES.STATUS, JSON.stringify(statusReport, null, 2));
    console.log("[System] STAT_V2: status.json successfully synthesized.");
}

generateStatus();
