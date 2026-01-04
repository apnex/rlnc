const fs = require('fs');
const path = require('path');
const os = require('os');
const { SOURCES } = require('./path_resolver');

async function onboard() {
    const isRefresh = process.argv.includes('--refresh');

    console.log("\n====================================================");
    console.log(`      🚀 ALPHA-V8 VELOCITY: SYSTEM ${isRefresh ? 'REFRESH' : 'ONBOARDING'}`);
    console.log("====================================================\n");

    if (!isRefresh) {
        // 1. Environmental Validation (Full Onboarding Only)
        console.log("--- [1/3] Environmental Check ---");
        const nodeVersion = process.version;
        const cpuCount = os.cpus().length;
        const platform = os.platform();
        
        console.log(`Node.js Version: ${nodeVersion}`);
        console.log(`CPU Cores:       ${cpuCount}`);
        console.log(`Platform:        ${platform}`);

        const requiredFiles = Object.values(SOURCES);
        const missing = requiredFiles.filter(f => !fs.existsSync(f));
        
        if (missing.length > 0) {
            console.error("\n[Error] Missing Critical Data Sources:");
            missing.forEach(f => console.log(` - ${f}`));
            process.exit(1);
        }
        console.log("Status:          All data sources validated.\n");
    }

    // 2. Protocol Briefing
    console.log(`--- [${isRefresh ? '1/2' : '2/3'}] Protocol Briefing ---`);
    const protocols = JSON.parse(fs.readFileSync(SOURCES.PROTOCOLS, 'utf8'));
    const manifest = protocols.system_manifest;
    const library = protocols.protocol_library;
    
    console.log(`Active Baseline: ${manifest.active_baseline}`);
    console.log(`Registry Index:  ${manifest.registry_index.join(', ')}`);
    console.log(`Core Philosophy: ${library.ONBOARD_V3.philosophy}\n`);

    // 2.5 Mapping Discovery (MAP_V1)
    console.log(`--- [${isRefresh ? '1.5/2' : '2.5/3'}] Architecture Discovery (MAP_V1) ---`);
    const metadata = JSON.parse(fs.readFileSync(SOURCES.METADATA, 'utf8'));
    console.log("Product Manifest Detected. Identifying Functional Domains:");
    metadata.module_overview.forEach(m => {
        console.log(` - [${m.module}]: ${m.purpose}`);
    });
    console.log("");

    // 3. Handshake/Refresh Preparation
    console.log(`--- [${isRefresh ? '2/2' : '3/3'}] ${isRefresh ? 'Refresh' : 'Handshake'} Deliverables ---`);
    if (isRefresh) {
        console.log("Protocol State Pulse:");
        manifest.registry_index.forEach(id => {
            const p = library[id];
            console.log(` - ${id.padEnd(12)} | v${p.version}`);
        });
        console.log("\nAction: Verify and Echo these versions in your next Survey phase.\n");
    } else {
        console.log("To complete ONBOARD_V3, provide the following Echo in the CLI:\n");
        
        console.log("1. Core Principles Alignment");
        library.ONBOARD_V3.principles.forEach(p => console.log(`   - ${p}`));
        
        console.log("\n2. Role Acknowledgment");
        console.log(`   - Engineer: ${library.ONBOARD_V3.roles.Engineer.designation} (STATUS: PENDING)`);
        console.log(`   - Director: ${library.ONBOARD_V3.roles.Director.designation}`);
        
            console.log("\n3. Interaction & Scope");
            console.log("   - Primary Loop: GSD_V3 (Gated Sequential Development)");
            console.log(`   - Exit Gate:    PRY_V1 (Engineer Proficiency Standard)`);
            console.log(`   - Review Gate:  PIR_V1 (Dual-Purpose Audit: Rigor & Friction Detection)`);
            console.log(`   - Authority:    ${path.basename(SOURCES.PROTOCOLS)}\n`);    }

    console.log("====================================================");
    console.log(`${isRefresh ? 'Refresh' : 'Onboarding'} Ready.`);
    console.log("====================================================\n");
}

onboard().catch(err => {
    console.error("Action Failed:", err);
    process.exit(1);
});
