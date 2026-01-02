/**
 * ALPHAv7 Comprehensive Threading Verification
 * Benchmarks Throughput, Latency, and Resilience with SHA-256 Integrity Checks.
 */

const crypto = require('crypto');
const GenerationEncoder = require('./generation_encoder');
const GenerationDecoder = require('./generation_decoder');
const PacketSerializer = require('../network/packet_serializer');
const NetworkSimulator = require('../network/network_simulator');

// Configuration
const CONFIG = {
    FILE_SIZE: 1024 * 1024 * 16, // 16 MB Test File
    TRANSCODE: {
        PIECE_COUNT: 64,
        PIECE_SIZE: 1024,   // 1KB symbols
        SYSTEMATIC: true
    },
    WINDOW: {
        SIZE: 8,            // Larger window to stress threading
        TIMEOUT: 200
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xAA,
        VERSION: 0x01,
        HEADER_SIZE: 8
    }
};

const FULL_CONFIG = {
    TRANSCODE: CONFIG.TRANSCODE,
    NETWORK: { REDUNDANCY: 1.0, LOSS_RATE: 0.0, LATENCY: 0 }, // Overridden per test
    WINDOW: CONFIG.WINDOW,
    PROTOCOL: CONFIG.PROTOCOL,
    // Flat props for legacy compatibility
    PIECE_COUNT: CONFIG.TRANSCODE.PIECE_COUNT,
    PIECE_SIZE: CONFIG.TRANSCODE.PIECE_SIZE
};

async function runSuite() {
    console.clear();
    
    // 1. Generate Source Data & Hash
    const sourceData = crypto.randomBytes(CONFIG.FILE_SIZE);
    const sourceHash = crypto.createHash('sha256').update(sourceData).digest('hex');

    console.log(`\n==============================================`);
    console.log(`🛡️  ALPHAv7 THREADING VERIFICATION SUITE`);
    console.log(`==============================================`);
    console.log(`Payload:      ${CONFIG.FILE_SIZE / (1024 * 1024)} MB`);
    console.log(`Payload Hash: ${sourceHash}`); // <--- Source of Truth
    console.log(`Symbol Size:  ${CONFIG.TRANSCODE.PIECE_SIZE} bytes`);
    console.log(`Block Size:   ${CONFIG.TRANSCODE.PIECE_COUNT} symbols`);
    console.log(`Threads:      4`);
    console.log(`==============================================\n`);

    // TEST 1: RAW THROUGHPUT
    await runTest("🚀 THROUGHPUT (Ideal Network)", sourceData, sourceHash, {
        lossRate: 0.0,
        delay: 0,
        jitter: 0,
        redundancy: 1.2
    });

    // TEST 2: RESILIENCE
    await runTest("🔥 RESILIENCE (10% Loss + Jitter)", sourceData, sourceHash, {
        lossRate: 0.1, // 10% Packet Loss
        delay: 5,      // 5ms Latency
        jitter: 2,     // +/- 2ms Jitter
        redundancy: 1.5
    });
}

async function runTest(testName, data, expectedHash, netProfile) {
    console.log(`[Running] ${testName}...`);
    
    // Setup Config
    const runConfig = JSON.parse(JSON.stringify(FULL_CONFIG));
    runConfig.NETWORK.REDUNDANCY = netProfile.redundancy;

    // Initialize Components
    const encoder = new GenerationEncoder(data, runConfig);
    const decoder = new GenerationDecoder(runConfig);
    
    // Initialize Simulator
    const net = new NetworkSimulator(netProfile);

    // Metrics
    const metrics = {
        packetsSent: 0,
        packetsDropped: 0,
        bytesTransferred: 0,
        boosts: 0,
        generationsSolved: 0,
        startTime: 0,
        endTime: 0
    };

    return new Promise((resolve) => {
        metrics.startTime = performance.now();

        // --- Wiring ---

        // 1. Encoder -> Network
        encoder.on('packet', (buf) => {
            // Need to deserialize momentarily to get header info (simulating app logic)
            // In a real app we might just forward the buffer, but here we track bytes
            metrics.packetsSent++;
            metrics.bytesTransferred += buf.length;
            net.send(buf);
        });

        // 2. Encoder Watchdog (Boost Tracker)
        encoder.on('watchdog_slide', () => {
            metrics.boosts++;
        });

        // 3. Network -> Decoder
        net.on('packet', (buf) => {
            const piece = PacketSerializer.deserialize(buf, runConfig.PROTOCOL);
            if (piece) {
                decoder.addPiece(piece);
            }
        });

        // 4. Decoder -> Feedback (Ack)
        decoder.on('generation_ready', (genId) => {
            metrics.generationsSolved++;
            encoder.acknowledge(genId);
            
            process.stdout.write(`\r  Progress: ${(metrics.generationsSolved / encoder.totalGenerations * 100).toFixed(1)}% `);
            
            if (metrics.generationsSolved >= encoder.totalGenerations) {
                finish();
            }
        });

        // --- Execution ---

        // Pump the loop
        const tickRate = 1; // ms
        const batchSize = 10; // Packets per tick
        
        const loop = setInterval(() => {
            if (!encoder.isFinished()) {
                encoder.produce(batchSize);
            }
        }, tickRate);

        function finish() {
            clearInterval(loop);
            metrics.endTime = performance.now();
            
            const result = decoder.getReconstructedFile();
            const resultHash = crypto.createHash('sha256').update(result).digest('hex');
            const passed = (resultHash === expectedHash);

            encoder.terminate();
            printReport(testName, metrics, CONFIG.FILE_SIZE, passed, resultHash);
            resolve();
        }
    });
}

function printReport(name, m, totalBytes, passed, actualHash) {
    const durationSec = (m.endTime - m.startTime) / 1000;
    const mbProcessed = totalBytes / (1024 * 1024);
    const throughput = mbProcessed / durationSec;
    const wireBytesMB = m.bytesTransferred / (1024 * 1024);
    const overhead = ((wireBytesMB / mbProcessed) - 1) * 100;

    console.log(`\n\n  📊 RESULTS: ${name}`);
    console.log(`  -------------------------------------------`);
    console.log(`  Status:          ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Actual Hash:     ${actualHash}`); // Full Hash displayed
    console.log(`  -------------------------------------------`);
    console.log(`  Time:            ${durationSec.toFixed(2)}s`);
    console.log(`  Throughput:      ${throughput.toFixed(2)} MB/s (Application Data)`);
    console.log(`  Wire Traffic:    ${wireBytesMB.toFixed(2)} MB`);
    console.log(`  Overhead:        ${overhead.toFixed(1)}%`);
    console.log(`  Packets Sent:    ${m.packetsSent}`);
    console.log(`  Boost Events:    ${m.boosts}`);
    console.log(`  -------------------------------------------\n`);
}

runSuite().catch(console.error);
