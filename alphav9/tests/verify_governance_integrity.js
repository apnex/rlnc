const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SANDBOX_FILE = path.join(__dirname, 'sandbox_protocols.json');
const INTEGRITY_TOOL = path.join(__dirname, '../tools/verify_integrity.js');

// Mock Data for Sandbox
const mockProtocols = {
    protocol_library: {
        "TEST_V1": {
            "protocol_name": "Test Protocol",
            "version": "1.0.0",
            "interaction_standard": {
                "data_standard": [{ "trigger": "Init", "requirement": "Test" }]
            },
            "operational_workflow": [
                { "id": "STEP_1", "action": "Test" }
            ]
        }
    }
};

function runAudit(mode) {
    try {
        return execSync(`PROTOCOL_PATH=${SANDBOX_FILE} node ${INTEGRITY_TOOL} ${mode}`, { encoding: 'utf8' });
    } catch (e) {
        return e.stdout + e.stderr;
    }
}

async function runTest() {
    console.log("--- Starting Governance Integrity Sandbox Test ---\n");

    // 1. Initial State
    fs.writeFileSync(SANDBOX_FILE, JSON.stringify(mockProtocols, null, 2));
    console.log("[Step 1] Creating Snapshot...");
    runAudit('--snapshot');

    // 2. Valid Modification (Add a row)
    console.log("[Step 2] Testing Valid Modification (Fidelity: VERIFIED)...");
    const validMod = JSON.parse(JSON.stringify(mockProtocols));
    validMod.protocol_library.TEST_V1.interaction_standard.data_standard.push({ "trigger": "Update", "requirement": "Valid" });
    fs.writeFileSync(SANDBOX_FILE, JSON.stringify(validMod, null, 2));
    let output = runAudit('--verify');
    if (output.includes("MODIFIED") && output.includes("VERIFIED")) {
        console.log(" ✅ Passed.");
    } else {
        console.error(" ❌ Failed.");
    }

    // 3. Schema Regression (Table to String)
    console.log("[Step 3] Testing Schema Regression (Fidelity: REGRESSION)...");
    const schemaReg = JSON.parse(JSON.stringify(mockProtocols));
    schemaReg.protocol_library.TEST_V1.interaction_standard.data_standard = "Corrupted String";
    fs.writeFileSync(SANDBOX_FILE, JSON.stringify(schemaReg, null, 2));
    output = runAudit('--verify');
    if (output.includes("REGRESSION")) {
        console.log(" ✅ Passed (Regression Detected).");
    } else {
        console.error(" ❌ Failed (Regression Missed).");
    }

    // 4. Workflow Regression (Deleted Step)
    console.log("[Step 4] Testing Workflow Regression (Fidelity: REGRESSION)...");
    const workflowReg = JSON.parse(JSON.stringify(mockProtocols));
    workflowReg.protocol_library.TEST_V1.operational_workflow = []; // Deleted step
    fs.writeFileSync(SANDBOX_FILE, JSON.stringify(workflowReg, null, 2));
    output = runAudit('--verify');
    if (output.includes("REGRESSION")) {
        console.log(" ✅ Passed (Regression Detected).");
    } else {
        console.error(" ❌ Failed (Regression Missed).");
    }

    // 5. Auto-Restore (Heal the Library)
    console.log("[Step 5] Testing Auto-Restore (Healing the Sandbox)...");
    output = runAudit('--restore');
    // console.log(output); // Debug
    if (output.includes("RESTORED")) {
        // After restore, run verify again to check if it's STABLE
        output = runAudit('--verify');
        if (output.includes("STABLE")) {
            console.log(" ✅ Passed (Library Healed).");
        } else {
            console.error(" ❌ Failed (Not Stable after restore). Output: " + output);
        }
    } else {
        console.error(" ❌ Failed (Restore Failed). Output: " + output);
    }

    // Cleanup
    console.log("\n--- Cleaning Up Sandbox ---");
    if (fs.existsSync(SANDBOX_FILE)) fs.unlinkSync(SANDBOX_FILE);
    if (fs.existsSync(SANDBOX_FILE + '.integrity.snapshot.json')) fs.unlinkSync(SANDBOX_FILE + '.integrity.snapshot.json');
    if (fs.existsSync(SANDBOX_FILE + '.baseline')) fs.unlinkSync(SANDBOX_FILE + '.baseline');
    console.log("Done.");
}

runTest();
