const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { SOURCES } = require('./path_resolver');

// Allow custom protocol path for testing/sandboxing
const PROTOCOL_PATH = process.env.PROTOCOL_PATH || SOURCES.PROTOCOLS;
const SNAPSHOT_FILE = PROTOCOL_PATH + '.integrity.snapshot.json';
const BASELINE_BACKUP = PROTOCOL_PATH + '.baseline';

function getProtocolSignatures(protocolFile) {
    const protocols = JSON.parse(fs.readFileSync(protocolFile, 'utf8'));
    const signatures = {};
    
    Object.entries(protocols.protocol_library).forEach(([id, p]) => {
        const content = JSON.stringify(p);
        const standardKeys = [];
        if (p.interaction_standard) {
            Object.entries(p.interaction_standard).forEach(([k, v]) => {
                if (k.endsWith('_standard') && Array.isArray(v)) {
                    standardKeys.push(k);
                }
            });
        }

        signatures[id] = {
            hash: crypto.createHash('sha256').update(content).digest('hex'),
            version: p.version,
            standard_keys: standardKeys,
            workflow_steps: (p.operational_workflow || []).length
        };
    });
    return signatures;
}

function auditReferentialIntegrity(protocolFile) {
    const protocols = JSON.parse(fs.readFileSync(protocolFile, 'utf8'));
    const registryIds = new Set([
        ...(protocols.deliverable_registry || []).map(d => d.id),
        ...(protocols.compliance_registry || []).map(c => c.id)
    ]);
    const foundReferences = new Set();
    const errors = [];

    const content = JSON.stringify(protocols.protocol_library);
    const regex = /(DLR|CMP)_[A-Z0-9_]+/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        foundReferences.add(match[0]);
    }

    foundReferences.forEach(ref => {
        if (!registryIds.has(ref)) {
            errors.push(`[Missing] Reference ${ref} has no definition in deliverable_registry.`);
        }
    });

    registryIds.forEach(id => {
        if (!foundReferences.has(id)) {
            // Optional: Log orphans but don't fail unless strict mode
            // console.log(`[Orphan] Deliverable ${id} is defined but not referenced.`);
        }
    });

    return errors;
}

function displayGranularDiff(id, oldP, newP) {
    console.log(`\n[FIDELITY DIFF: ${id}]`);
    
    // Compare Interaction Standards
    const oldStandards = oldP.interaction_standard || {};
    const newStandards = newP.interaction_standard || {};
    const allStandardKeys = Array.from(new Set([...Object.keys(oldStandards), ...Object.keys(newStandards)]));
    
    allStandardKeys.forEach(key => {
        if (!key.endsWith('_standard')) return;
        const oldTable = oldStandards[key] || [];
        const newTable = newStandards[key] || [];
        
        console.log(`- Standard [${key}]:`);
        if (!Array.isArray(newTable)) {
            console.log(`  [⚠️ REGRESSION] Standard corrupted: Expected array, found ${typeof newTable}`);
            return;
        }
        const getMatchKey = (item) => item.trigger || item.deliverable || item.rule || item.metric || JSON.stringify(item);
        
        const oldMap = new Map(oldTable.map(item => [getMatchKey(item), item]));
        const newMap = new Map(newTable.map(item => [getMatchKey(item), item]));
        const allItemKeys = Array.from(new Set([...oldMap.keys(), ...newMap.keys()]));
        
        allItemKeys.forEach(itemKey => {
            const oldItem = oldMap.get(itemKey);
            const newItem = newMap.get(itemKey);
            
            if (oldItem && newItem) {
                if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                    console.log(`  [MODIFIED]  ${itemKey}`);
                    Object.keys(newItem).forEach(k => {
                        if (JSON.stringify(oldItem[k]) !== JSON.stringify(newItem[k])) {
                            console.log(`    ${k}: ${JSON.stringify(oldItem[k])} -> ${JSON.stringify(newItem[k])}`);
                        }
                    });
                }
            } else if (newItem) {
                console.log(`  [ADDED]     ${itemKey}`);
            } else if (oldItem) {
                console.log(`  [REMOVED]   ${itemKey}`);
            }
        });
    });

    // Compare Workflow
    const oldWorkflow = oldP.operational_workflow || [];
    const newWorkflow = newP.operational_workflow || [];
    const oldWorkflowMap = new Map(oldWorkflow.map(s => [s.id, s]));
    const newWorkflowMap = new Map(newWorkflow.map(s => [s.id, s]));
    const allStepIds = Array.from(new Set([...oldWorkflowMap.keys(), ...newWorkflowMap.keys()]));
    
    if (allStepIds.length > 0) {
        console.log(`- Workflow:`);
        allStepIds.forEach(stepId => {
            const oldStep = oldWorkflowMap.get(stepId);
            const newStep = newWorkflowMap.get(stepId);
            if (oldStep && newStep) {
                if (JSON.stringify(oldStep) !== JSON.stringify(newStep)) {
                    console.log(`  [MODIFIED]  ${stepId}`);
                    if (oldStep.action !== newStep.action) console.log(`    Action: ${oldStep.action} -> ${newStep.action}`);
                }
            } else if (newStep) {
                console.log(`  [ADDED]     ${stepId}: ${newStep.action}`);
            } else if (oldStep) {
                console.log(`  [REMOVED]   ${stepId}`);
            }
        });
    }
}

function run() {
    const mode = process.argv[2];
    
    if (mode === '--snapshot') {
        const sigs = getProtocolSignatures(PROTOCOL_PATH);
        fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(sigs, null, 2));
        fs.copyFileSync(PROTOCOL_PATH, BASELINE_BACKUP);
        console.log(`[Integrity] Snapshot and Baseline Backup captured for ${Object.keys(sigs).length} protocols.`);
    } else if (mode === '--verify' || mode === '--restore') {
        if (!fs.existsSync(SNAPSHOT_FILE) || !fs.existsSync(BASELINE_BACKUP)) {
            console.error(`[Error] Integrity artifacts missing. Run with --snapshot first.`);
            process.exit(1);
        }
        
        const oldSigs = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
        const newSigs = getProtocolSignatures(PROTOCOL_PATH);
        const baseline = JSON.parse(fs.readFileSync(BASELINE_BACKUP, 'utf8'));
        const live = JSON.parse(fs.readFileSync(PROTOCOL_PATH, 'utf8'));
        
        console.log(`\n[PROTOCOL INTEGRITY AUDIT - MODE: ${mode.replace('--','').toUpperCase()}]`);
        console.log("--------------------------------------------------------------------------------");
        console.log(String("Protocol").padEnd(15) + " | " + String("State").padEnd(10) + " | " + String("Fidelity Status").padEnd(25));
        console.log("--------------------------------------------------------------------------------");
        
        let regressionDetected = false;
        let restoredCount = 0;
        let modifiedProtocols = [];
        
        Object.keys(newSigs).forEach(id => {
            const old = oldSigs[id];
            const curr = newSigs[id];
            let state = "UNCHANGED";
            let status = "STABLE";
            
            if (!old) {
                state = "NEW";
                status = "VERIFIED";
            } else if (old.hash !== curr.hash) {
                state = "MODIFIED";
                modifiedProtocols.push(id);
                const lostKeys = old.standard_keys.filter(k => !curr.standard_keys.includes(k));
                if (lostKeys.length > 0 || curr.workflow_steps < old.workflow_steps) {
                    status = "⚠️ REGRESSION";
                    regressionDetected = true;
                    
                    if (mode === '--restore') {
                        live.protocol_library[id] = baseline.protocol_library[id];
                        status = "✅ RESTORED";
                        restoredCount++;
                    }
                } else {
                    status = "VERIFIED";
                }
            }
            
            console.log(id.padEnd(15) + " | " + state.padEnd(10) + " | " + status.padEnd(25));
        });
        console.log("--------------------------------------------------------------------------------");
        console.log(`Total Protocols: ${Object.keys(newSigs).length}`);
        console.log("--------------------------------------------------------------------------------");

        // High Verbosity Granular Diff
        if (modifiedProtocols.length > 0) {
            modifiedProtocols.forEach(id => {
                displayGranularDiff(id, baseline.protocol_library[id], live.protocol_library[id]);
            });
            console.log("--------------------------------------------------------------------------------\n");
        }

        // Referential Integrity Audit
        const refErrors = auditReferentialIntegrity(PROTOCOL_PATH);
        if (refErrors.length > 0) {
            console.log("[REFERENTIAL INTEGRITY AUDIT]");
            refErrors.forEach(err => console.log(`  ${err}`));
            console.log("--------------------------------------------------------------------------------\n");
            regressionDetected = true;
        }
        
        if (mode === '--restore' && restoredCount > 0) {
            fs.writeFileSync(PROTOCOL_PATH, JSON.stringify(live, null, 2));
            console.log(`[Success] Restored ${restoredCount} protocols to baseline fidelity.\n`);
            process.exit(0);
        }

        if (regressionDetected && mode === '--verify') {
            console.error("[Critical] Structural regression detected. Use --restore to heal the library.");
            process.exit(1);
        }
    }
}

if (require.main === module) {
    run();
}