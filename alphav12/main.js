const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Configuration Injector ---
let config;
const args = process.argv.slice(2);

// Filter out flags from args
const flags = args.filter(a => a.startsWith('--'));
const posArgs = args.filter(a => !a.startsWith('--'));

const firstArg = posArgs[0];

if (firstArg && firstArg.endsWith('.js')) {
    try {
        const configPath = path.resolve(process.cwd(), firstArg);
        config = require(configPath);
        console.log(`[System] Injected Config: ${firstArg}`);
    } catch (e) {
        console.error(`[Error] Failed to load config file: ${firstArg}`);
        process.exit(1);
    }
} else {
    console.log(`[System] No injector config provided. Using default ./config.js`);
    config = require('./config');
}

const Engine = require('./core/engine');
const Source = require('./core/source');
const Sink = require('./core/sink');

async function main() {
    const isSourceMode = flags.includes('--source');
    const isSinkMode = flags.includes('--sink');

    // 1. Sink Mode
    if (isSinkMode) {
        console.log(`[System] Booting in SINK mode...`);
        const sink = new Sink(config);
        await sink.run();
        return;
    }

    // 2. Data Preparation (Source/Unified)
    let data, filename;
    if (config.DATA.INPUT_PATH && fs.existsSync(config.DATA.INPUT_PATH)) {
        filename = config.DATA.INPUT_PATH;
        console.log(`[Source] Reading from Config: '${filename}'...`);
        data = fs.readFileSync(filename);
    } else {
        filename = "RandomBytes";
        const sizeMB = (config.DATA.DUMMY_SIZE / (1024 * 1024)).toFixed(1);
        console.log(`[Source] No input file found. Generating ${sizeMB}MB random data...`);
        data = crypto.randomBytes(config.DATA.DUMMY_SIZE); 
    }
    const sourceHash = crypto.createHash('sha256').update(data).digest('hex');

    // 3. Source Mode
    if (isSourceMode) {
        console.log(`[System] Booting in SOURCE mode...`);
        const source = new Source(data, config, filename, sourceHash);
        await source.run();
        return;
    }

    // 4. Unified/Simulated Mode (Default)
    console.log(`[System] Booting in UNIFIED SIMULATION mode...`);
    const threads = (config.SYSTEM && config.SYSTEM.THREADS !== undefined) ? config.SYSTEM.THREADS : 0;
    console.log(`Initializing Worker Pool (${threads === 0 ? 'Adaptive' : threads + ' Threads'})...`);

    const engine = new Engine(data, config, filename, sourceHash);
    await engine.run();
    process.exit(0);
}

main().catch(err => { 
    console.error("Fatal Error:", err); 
    process.exit(1); 
});

// VFY_MODULAR_DECOUPLING: Verified on Mon 19 Jan 2026 09:52:49 PM AEDT
// Governance Trace: Mon 19 Jan 2026 09:53:46 PM AEDT
