/**
 * ALPHAv10 Core Verify Coders (v10-alpha-01)
 * Advanced Performance Analytics: ns/byte, Decode/Encode Ratio, and Throughput.
 */

const BlockEncoder = require('./block_encoder');
const BlockDecoder = require('./block_decoder');
const CodedPiece = require('../network/coded_piece');
const crypto = require('crypto');

const CONFIG = {
    ITERATIONS: 100,
    GEN_ID: 101,
    ENCODER_CONFIG: {
        PIECE_COUNT: 16,
        PIECE_SIZE: 1024 * 64, // 64KB
        SYSTEMATIC: true
    },
    OVERHEAD: 2,
    REDUNDANCY_COUNT: 0 // For structure parity with stress test
};

async function runCoderTest() {
    const { PIECE_COUNT, PIECE_SIZE } = CONFIG.ENCODER_CONFIG;
    const bytesPerGen = PIECE_COUNT * PIECE_SIZE;

    console.log(`=========================================`);
    console.log(`🚀 ALPHAv10 ADVANCED STRESS TEST`);
    console.log(`=========================================`);
    console.log(`Loops:      ${CONFIG.ITERATIONS}`);
    console.log(`Generation: ${bytesPerGen / 1024} KB (${PIECE_COUNT} symbols)`);
    console.log(`Systematic: ${CONFIG.ENCODER_CONFIG.SYSTEMATIC ? "ENABLED ✅" : "DISABLED ❌"}`);
    console.log(`Alignment:  8-byte Aligned (Safe)`);
    console.log(`=========================================\n`);

    const stats = { 
        total: 0, 
        success: 0, 
        checksumFail: 0, 
        decodeFail: 0, 
        encodeMs: 0, 
        decodeMs: 0 
    };

    for (let i = 0; i < CONFIG.ITERATIONS; i++) {
        const rawData = crypto.randomBytes(bytesPerGen);
        const sourceHash = crypto.createHash('sha256').update(rawData).digest('hex');

        // 1. Encode Measurement
        const t0 = performance.now();
        const encoder = new BlockEncoder(rawData, CONFIG.ENCODER_CONFIG);
        const stream = [];
        for (let j = 0; j < (PIECE_COUNT + CONFIG.OVERHEAD); j++) {
            const raw = encoder.codedPiece();
            stream.push(new CodedPiece(CONFIG.GEN_ID, raw.coeffs, raw.data));
        }
        stats.encodeMs += (performance.now() - t0);

        // 2. Decode Measurement
        const t1 = performance.now();
        const decoder = new BlockDecoder(CONFIG.ENCODER_CONFIG);
        
        // Randomize packet arrival order to simulate network jitter
        const chaoticStream = stream.sort(() => Math.random() - 0.5);
        
        let result = null;
        for (const piece of chaoticStream) {
            if (decoder.addPiece(piece)) {
                result = decoder.getData();
                break; 
            }
        }
        stats.decodeMs += (performance.now() - t1);

        // 3. Integrity Verification
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

    printReport(stats, bytesPerGen);
}

function printReport(s, bytesPerGen) {
    const totalBytes = s.total * bytesPerGen;
    const mbProcessed = totalBytes / (1024 * 1024);
    const totalMs = s.encodeMs + s.decodeMs;
    const totalTimeSec = totalMs / 1000;

    // Advanced Metrics Calculation
    const nsPerByte = (totalMs * 1000000) / totalBytes;
    const decodeEncodeRatio = (s.decodeMs / s.encodeMs);

    console.log(`\n\n--- 📊 v10 ADVANCED PERFORMANCE REPORT ---`);
    console.log(`Success Rate:      ${((s.success / s.total) * 100).toFixed(2)}%`);
    console.log(`Decode Fails:      ${s.decodeFail}`);
    console.log(`Checksum Errors:   ${s.checksumFail}`);
    console.log(`------------------------------------------`);
    console.log(`Avg Encoding:      ${(s.encodeMs / s.total).toFixed(3)} ms`);
    console.log(`Avg Decoding:      ${(s.decodeMs / s.total).toFixed(3)} ms`);
    console.log(`Decode/Encode:     ${(decodeEncodeRatio * 100).toFixed(1)}%`);
    console.log(`------------------------------------------`);
    console.log(`Latency per Byte:  ${nsPerByte.toFixed(2)} ns/byte`);
    console.log(`Eff. Throughput:   ${(mbProcessed / totalTimeSec).toFixed(2)} MB/s`);
    console.log(`------------------------------------------\n`);
    
    if (decodeEncodeRatio > 2.0) {
        console.log(`💡 ADVICE: Decoder is >200% slower than Encoder. Consider S-Box optimization for Decoder.\n`);
    }
}

runCoderTest().catch(console.error);
