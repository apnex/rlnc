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

const GenerationEncoder = require('./threading/generation_encoder');
const GenerationDecoder = require('./threading/generation_decoder');
const PacketSerializer = require('./network/packet_serializer');
const NetworkSimulator = require('./network/network_simulator');
const VisualDashboard = require('./utils/visual_dashboard');

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
    if (!config.SYSTEM.THREADS || config.SYSTEM.THREADS === 0) {
        config.SYSTEM.THREADS = os.cpus().length;
    }
    console.log(`Initializing Worker Pool (${config.SYSTEM.THREADS} Threads)...`);

    const enc = GenerationEncoder.create(data, config);
    config.TOTAL_GENS = enc.totalGenerations;
    const dec = GenerationDecoder.create(config);
    const dash = new VisualDashboard(config, sourceHash, filename, data.length);

    const netOptions = {
        lossRate: config.NETWORK.LOSS_RATE,
        delay: config.NETWORK.LATENCY,
        jitter: config.NETWORK.JITTER
    };
    const forwardNet = new NetworkSimulator(netOptions);
    const returnNet = new NetworkSimulator(netOptions);

    enc.on('packet', (buf) => {
        const header = PacketSerializer.deserialize(buf, config.PROTOCOL);
        if (!header) return;
        dash.initGen(header.genId, config.TRANSCODE.PIECE_COUNT);
        dash.updateGen(header.genId, { sent: dash.generations.get(header.genId).sent + 1 });
        dash.addGlobalStat('totalPackets');
        dash.registerTraffic(buf.length, 'tx');
        forwardNet.send(buf);
    });

    const solvedGenerations = new Set();
    function sendAck(genId) {
        const ackBuf = Buffer.alloc(4);
        ackBuf.writeUInt32BE(genId, 0);
        returnNet.send(ackBuf);
    }

    forwardNet.on('packet', (buf) => {
        const pRecv = PacketSerializer.deserialize(buf, config.PROTOCOL);
        if (pRecv) {
            if (solvedGenerations.has(pRecv.genId)) {
                sendAck(pRecv.genId); 
                return; 
            }
            const gen = dash.generations.get(pRecv.genId);
            if (gen) dash.updateGen(pRecv.genId, { recv: gen.recv + 1 });
            dash.registerTraffic(buf.length, 'rx');
            dec.addPiece(pRecv);
        }
    });

    dec.on('generation_ready', (id) => {
        solvedGenerations.add(id); 
        sendAck(id);
    });

    returnNet.on('packet', (ackBuf) => {
        const id = ackBuf.readUInt32BE(0);
        if (!enc.ackedGenerations.has(id)) {
            dash.updateGen(id, { acked: true });
            enc.acknowledge(id); 
        }
    });

    enc.on('watchdog_slide', (id) => {
        const gen = dash.generations.get(id);
        dash.updateGen(id, { boosted: true, boostCount: (gen ? gen.boostCount : 0) + 1 });
        dash.addGlobalStat('boosts');
    });

    const targetThroughputMB = config.SYSTEM.TARGET_THROUGHPUT_MB;
    const packetSize = config.TRANSCODE.PIECE_SIZE;
    const tickRate = config.SYSTEM.TICK_RATE; 
    const packetsPerTick = Math.ceil((targetThroughputMB * 1024 * 1024) / packetSize / (1000 / tickRate));

    const loop = setInterval(() => {
        for (const id of enc.window) {
            dash.initGen(id, config.TRANSCODE.PIECE_COUNT);
        }
        if (!enc.isFinished()) {
            enc.produce(packetsPerTick);
        }
        dash.render();
        if (enc.isFinished() && enc.window.size === 0) {
            clearInterval(loop);
            setTimeout(finish, 1000); 
        }
    }, tickRate);

    function finish() {
        enc.terminate(); 
        const result = dec.getReconstructedFile();
        let finalHash = "FAILURE";
        if (result) {
            const cleanResult = result.slice(0, data.length);
            finalHash = crypto.createHash('sha256').update(cleanResult).digest('hex');
            if (config.DATA.INPUT_PATH && fs.existsSync(config.DATA.INPUT_PATH)) {
                const outName = `restored_${path.basename(filename)}`;
                fs.writeFileSync(outName, cleanResult);
            }
        }
        dash.setFinalHash(finalHash);
        dash.render();
        console.log("\n=== SESSION COMPLETE ===");
        process.exit(0);
    }
}
main().catch(err => { console.error("Fatal Error:", err); process.exit(1); });
