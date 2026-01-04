const fs = require('fs');
const { execSync } = require('child_process');
const { SOURCES } = require('./path_resolver');

function calculateNextVersion(current, type) {
    const parts = current.split('.').map(Number);
    if (type === '--major') {
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
    } else if (type === '--minor') {
        parts[1]++;
        parts[2] = 0;
    } else {
        // Default: Patch
        parts[2]++;
    }
    return parts.join('.');
}

function finalize() {
    let args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("[Error] No change descriptions provided.");
        console.log("Usage: node tools/finalizer.js [--gov] [--major|--minor|--patch] \"Change 1\" \"Change 2\" ...");
        process.exit(1);
    }

    // 1. Detect Mode and Version Type
    let isGov = false;
    if (args[0] === '--gov') {
        isGov = true;
        args.shift();
    }

    let versionType = '--patch';
    if (['--major', '--minor', '--patch'].includes(args[0])) {
        versionType = args.shift();
    }

    if (args.length === 0) {
        console.error("[Error] No change descriptions provided.");
        process.exit(1);
    }

    // 2. Load Target Changelog
    const changelogPath = isGov ? SOURCES.GOVERNANCE_CHANGELOG : SOURCES.CHANGELOG;
    const history = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));
    const historyKey = isGov ? 'governance_changelog' : 'changelog';
    const currentVersion = history[historyKey][0].version;
    
    // 3. Increment Version
    const nextVersion = calculateNextVersion(currentVersion, versionType);

    // 3.5 Integrity Gate
    console.log("[System] Executing Protocol Integrity Gate...");
    try {
        execSync('node tools/verify_integrity.js --verify', { stdio: 'inherit' });
    } catch (e) {
        console.error("[Error] Integrity check failed. Finalization aborted.");
        process.exit(1);
    }

    // 4. Prepare New Entry
    const newEntry = {
        version: nextVersion,
        date: new Date().toISOString().split('T')[0],
        changes: args
    };

    // 5. Update Target Changelog
    history[historyKey].unshift(newEntry);
    fs.writeFileSync(changelogPath, JSON.stringify(history, null, 2));
    console.log(`[Success] Updated ${isGov ? 'Governance' : 'Project'} changelog to v${nextVersion} (${versionType.replace('--', '')})`);

    // 6. Synchronize Artifacts
    console.log("[System] Synchronizing artifacts...");
    try {
        execSync('node docs/generate_status.js', { stdio: 'inherit' });
        execSync('node docs/generate_readme.js', { stdio: 'inherit' });
        execSync('node tools/generate_protocols.js', { stdio: 'inherit' });
        console.log("[Success] All artifacts synchronized.");
    } catch (e) {
        console.error("[Error] Synchronization failed:", e.message);
        process.exit(1);
    }
}

finalize();