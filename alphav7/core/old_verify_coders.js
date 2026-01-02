/**
 * ALPHAv6 Core Verify Coders (v7-alpha-06)
 * Includes Configuration Header for improved result analysis
 */

const BlockEncoder = require('./block_encoder');
const BlockDecoder = require('./block_decoder');
const crypto = require('crypto');

const CONFIG = {
    ITERATIONS: 1000,
    GEN_ID: 101,
    ENCODER_CONFIG: {
        PIECE_COUNT: 16,
        PIECE_SIZE: 1024 * 64, // 64KB
        SYSTEMATIC: true
    },
    OVERHEAD: 2 
};

async function runCoderTest() {
    // --- 📋 CONFIGURATION MANIFEST ---
    console.log(`=========================================`);
    console.log(`🚀 ALPHAv7 CODER STRESS TEST`);
    console.log(`=========================================`);
    console.log(`Loops:      ${CONFIG.ITERATIONS}`);
    console.log(`Symbols:    ${CONFIG.ENCODER_CONFIG.PIECE_COUNT}`);
    console.log(`Piece Size: ${CONFIG.ENCODER_CONFIG.PIECE_SIZE / 1024} KB`);
    console.log(`Total Gen:  ${(CONFIG.ENCODER_CONFIG.PIECE_COUNT * CONFIG.ENCODER_CONFIG.PIECE_SIZE) / 1024} KB`);
    console.log(`Systematic: ${CONFIG.ENCODER_CONFIG.SYSTEMATIC ? "ENABLED ✅" : "DISABLED ❌"}`);
    console.log(`Overhead:   +${CONFIG.OVERHEAD} pieces`);
    console.log(`=========================================\n`);

    const stats = { total: 0, success: 0, checksumFail: 0, decodeFail: 0, encodeMs: 0, decodeMs: 0 };
    const { PIECE_COUNT, PIECE_SIZE } = CONFIG.ENCODER_CONFIG;

    for (let i = 0; i < CONFIG.ITERATIONS; i++) {
        const rawData = crypto.randomBytes(PIECE_COUNT * PIECE_SIZE);
        const sourceHash = crypto.createHash('sha256').update(rawData).digest('hex');

        const t0 = performance.now();
        const encoder = new BlockEncoder(rawData, CONFIG.GEN_ID, CONFIG.ENCODER_CONFIG);
        const stream = [];
        for (let j = 0; j < (PIECE_COUNT + CONFIG.OVERHEAD); j++) {
            stream.push(encoder.codedPiece());
        }
        stats.encodeMs += (performance.now() - t0);

        const t1 = performance.now();
        const decoder = new BlockDecoder(CONFIG.ENCODER_CONFIG);
        
        // Randomize packet arrival order to simulate real-world jitter
        const chaoticStream = stream.sort(() => Math.random() - 0.5);
        
        let result = null;
        for (const piece of chaoticStream) {
            if (decoder.addPiece(piece)) {
                result = decoder.getData();
                break; 
            }
        }
        stats.decodeMs += (performance.now() - t1);

        if (result) {
            const resultHash = crypto.createHash('sha256').update(result).digest('hex');
            if (sourceHash === resultHash) stats.success++;
            else stats.checksumFail++;
        } else {
            stats.decodeFail++;
        }
        stats.total++;
        if (i % 20 === 0 && i > 0) process.stdout.write('█');
    }

    printReport(stats);
}

function printReport(s) {
    const totalTime = (s.encodeMs + s.decodeMs) / 1000;
    const mbProcessed = (s.total * CONFIG.ENCODER_CONFIG.PIECE_COUNT * CONFIG.ENCODER_CONFIG.PIECE_SIZE) / (1024 * 1024);
    
    console.log(`\n\n--- 📊 v7 STATISTICAL REPORT ---`);
    console.log(`Success Rate:   ${((s.success / s.total) * 100).toFixed(2)}%`);
    console.log(`Decode Fails:   ${s.decodeFail}`);
    console.log(`Avg Encoding:   ${(s.encodeMs / s.total).toFixed(3)}ms`);
    console.log(`Avg Decoding:   ${(s.decodeMs / s.total).toFixed(3)}ms`);
    console.log(`Eff. Throughput: ${(mbProcessed / totalTime).toFixed(2)} MB/s`);
    console.log(`--------------------------------------\n`);
}

runCoderTest().catch(console.error);
