const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// --- Configuration Injector ---
let config;
const args = process.argv.slice(2);
const firstArg = args[0];

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

async function main() {
    let data, filename;

    // Data selection priority: Config.INPUT_PATH -> Dummy Data
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

    // v7 Hardware-Awareness: Dynamic Thread Scaling
    const threads = (config.SYSTEM && config.SYSTEM.THREADS !== undefined) ? config.SYSTEM.THREADS : 0;
    console.log(`Initializing Worker Pool (${threads === 0 ? 'Adaptive' : threads + ' Threads'})...`);

    const engine = new Engine(data, config, filename, sourceHash);
    await engine.run();
    process.exit(0);
}
main().catch(err => { console.error("Fatal Error:", err); process.exit(1); });
