const BlockEncoder = require('./block_encoder');
const BlockDecoder = require('./block_decoder');
const CodedPiece = require('../network/coded_piece');
const crypto = require('crypto');

/**
 * COMPREHENSIVE INCREMENTAL STRESS TEST (ALIGNED)
 * Targets the new GaloisMatrix primitives and BlockDecoder logic.
 * Aligned with verify_coders.js for fair performance comparison.
 */

const CONFIG = {
    ITERATIONS: 100,
    GEN_ID: 100,
    ENCODER_CONFIG: {
        PIECE_COUNT: 32,
        PIECE_SIZE: 1024 * 64 + 7, // 64KB + 7 (Non-Aligned)
        SYSTEMATIC: false
    },
    OVERHEAD: 2,
    REDUNDANCY_COUNT: 0 
};

async function run() {
    const { PIECE_COUNT, PIECE_SIZE } = CONFIG.ENCODER_CONFIG;
    console.log(`=========================================`);
    console.log(`🚀 ALPHAv11 INCREMENTAL STRESS TEST`);
    console.log(`Iterations: ${CONFIG.ITERATIONS}`);
    console.log(`Config:     ${PIECE_COUNT} symbols x ${PIECE_SIZE} bytes`);
    console.log(`=========================================\n`);

    const stats = { 
        total: 0, 
        success: 0, 
        encodeMs: 0, 
        decodeMs: 0,
        bytesProcessed: 0
    };

    for (let i = 0; i < CONFIG.ITERATIONS; i++) {
        const rawData = crypto.randomBytes(PIECE_COUNT * PIECE_SIZE);
        const sourceHash = crypto.createHash('sha256').update(rawData).digest('hex');

        // 1. Encode Phase
        const t0 = performance.now();
        const encoder = new BlockEncoder(rawData, { ...CONFIG.ENCODER_CONFIG, SYSTEMATIC: true });
        const packets = [];
        const overhead = 2; // Aligned with verify_coders
        for (let j = 0; j < (PIECE_COUNT + overhead); j++) {
            const raw = encoder.codedPiece();
            packets.push(new CodedPiece(CONFIG.GEN_ID, raw.coeffs, raw.data));
        }

        
        // Inject redundant packets
        for (let j = 0; j < CONFIG.REDUNDANCY_COUNT; j++) {
            packets.push(packets[Math.floor(Math.random() * PIECE_COUNT)]);
        }
        stats.encodeMs += (performance.now() - t0);

        // Shuffle
        packets.sort(() => Math.random() - 0.5);

        // 2. Decode Phase (Incremental)
        const t1 = performance.now();
        const decoder = new BlockDecoder(CONFIG.ENCODER_CONFIG);
        let result = null;
        for (const piece of packets) {
            const wasSolved = decoder.addPiece(piece);
            if (wasSolved) {
                result = decoder.getData();
                break;
            }
        }
        stats.decodeMs += (performance.now() - t1);

        // 3. Verification
        if (result) {
            const resultHash = crypto.createHash('sha256').update(result).digest('hex');
            if (sourceHash === resultHash) {
                stats.success++;
            } else {
                console.error(`❌ FAILURE: Hash mismatch at iteration ${i}`);
                process.exit(1);
            }
        } else {
            console.error(`❌ FAILURE: Decoder failed to solve at iteration ${i}. Rank: ${decoder.rank}/${PIECE_COUNT}`);
            process.exit(1);
        }

        stats.total++;
        stats.bytesProcessed += (PIECE_COUNT * PIECE_SIZE);
        if (i % 10 === 0 && i > 0) process.stdout.write('█');
    }

    const totalMs = stats.encodeMs + stats.decodeMs;
    const mbProcessed = stats.bytesProcessed / (1024 * 1024);
    const nsPerByte = (totalMs * 1000000) / stats.bytesProcessed;

    console.log(`\n\n--- 📊 STRESS TEST PERFORMANCE REPORT ---`);
    console.log(`Total Cycles:    ${stats.total}`);
    console.log(`Total Data:      ${(stats.bytesProcessed / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Total Time:      ${(totalMs / 1000).toFixed(3)} s`);
    console.log(`Success Rate:    ${((stats.success / stats.total) * 100).toFixed(2)}%`);
    console.log(`------------------------------------------`);
    console.log(`Avg Encoding:    ${(stats.encodeMs / stats.total).toFixed(3)} ms`);
    console.log(`Avg Decoding:    ${(stats.decodeMs / stats.total).toFixed(3)} ms`);
    console.log(`Eff. Throughput: ${(mbProcessed / (totalMs / 1000)).toFixed(2)} MB/s`);
    console.log(`Latency:         ${nsPerByte.toFixed(2)} ns/byte`);
    console.log(`------------------------------------------`);
    console.log(`Rank Safety:     PASSED`);
    console.log(`Alignment Check: PASSED (${PIECE_SIZE} bytes)`);
    console.log(`------------------------------------------\n`);
}

run().catch(console.error);