const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- TUI Framework Imports ---
const RLNCDashboard = require('./ui/rlnc_dashboard');
const SessionStats = require('./ui/session_stats');

// --- Configuration Manifest Ingestor (Logic-as-Code) ---
let config;
const args = process.argv.slice(2);

const flags = args.filter(a => a.startsWith('--'));
const posArgs = args.filter(a => !a.startsWith('--'));
const firstArg = posArgs[0];

const manifestPath = (firstArg && firstArg.endsWith('.json')) 
    ? path.resolve(process.cwd(), firstArg)
    : path.resolve(__dirname, './tests/manifests/production_default.json');

try {
    config = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
    console.error(`[FATAL] Failed to load sovereign manifest: ${manifestPath}`);
    process.exit(1);
}

// Map Manifest Schema to legacy internal keys for backward compatibility (Mission D Target)
const internalConfig = {
    DATA: { DUMMY_SIZE: config.data?.size || 1024*1024, INPUT_PATH: config.data?.source === 'DUMMY' ? null : config.data?.source },
    TRANSCODE: { PIECE_COUNT: config.math?.n || 512, PIECE_SIZE: config.math?.s || 1024, SYSTEMATIC: config.math?.systematic_flag || false },
    NETWORK: { TRANSPORT: config.network?.transport_layer === 'UDP_JUMBO' ? 'udp' : 'loopback', LOSS_RATE: config.network?.loss_rate || 0, LATENCY: 0, JITTER: 0 },
    SYSTEM: { THREADS: 4, TICK_RATE: 10, TARGET_THROUGHPUT_MB: 10 }
};

const Engine = require('./core/engine');
const Source = require('./core/source');
const Sink = require('./core/sink');

async function main() {
    const isSourceMode = flags.includes('--source');
    const isSinkMode = flags.includes('--sink');
    const mode = isSourceMode ? 'source' : (isSinkMode ? 'sink' : 'unified');

    // 1. Meta Preparation
    let data, filename;
    if (isSinkMode) {
        filename = "IncomingStream";
    } else if (internalConfig.DATA.INPUT_PATH && fs.existsSync(internalConfig.DATA.INPUT_PATH)) {
        filename = internalConfig.DATA.INPUT_PATH;
        data = fs.readFileSync(filename);
    } else {
        filename = "RandomBytes";
        data = crypto.randomBytes(internalConfig.DATA.DUMMY_SIZE);
    }
    const sourceHash = isSinkMode ? "Pending..." : crypto.createHash('sha256').update(data).digest('hex');

    // 2. Initialize Operational Component
    let engine;
    if (isSinkMode) {
        engine = new Sink(internalConfig);
    } else if (isSourceMode) {
        engine = new Source(data, internalConfig, filename, sourceHash);
    } else {
        engine = new Engine(data, internalConfig, filename, sourceHash);
    }

    // 3. Initialize TUI Stack
    const dashboard = new RLNCDashboard(config, { mode, width: 140 });
    const stats = new SessionStats({
        mode,
        config,
        meta: { filename, hash: sourceHash, filesize: data ? data.length : 0 }
    });

    // 4. Start Heartbeat (10Hz Pull Model)
    const uiLoop = setInterval(() => {
        // Late-bind components
        if (!stats.encoder && engine.enc) stats.encoder = engine.enc;
        if (!stats.decoder && engine.dec) stats.decoder = engine.dec;
        if (!stats.window && engine.window) stats.window = engine.window;
        if (!stats.transport && engine.transport) stats.transport = engine.transport;

        const snapshot = stats.getSnapshot();
        dashboard.sync(snapshot);
        dashboard.render();
    }, 100);

    // 5. Execution
    try {
        await engine.run();

        // Final Sync for COMPLETE state
        const finalSnap = stats.getSnapshot();

        // Final Reconstruct Check
        const decoder = engine.dec;
        if (decoder) {
            const reconstructed = decoder.getReconstructedFile();
            if (reconstructed) {
                finalSnap.metrics.finalHash = crypto.createHash('sha256').update(reconstructed).digest('hex');
            }
        }
        dashboard.sync(finalSnap);
        dashboard.render();
    } catch (err) {
        console.error("\n[FATAL]", err);
    } finally {
        clearInterval(uiLoop);

        // Wait a moment for the user to see the final state
        setTimeout(() => process.exit(0), 2000);
    }
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
