/**
 * ALPHAv8 S-Box Upper Bound Profiler
 * Force 'Full Coded' mode to measure pure linear algebra performance.
 */

const BlockEncoder = require('./block_encoder');
const BlockDecoder = require('./block_decoder');
const crypto = require('crypto');

const CONFIG = {
    ITERATIONS: 500,
    GEN_ID: 202,
    ENCODER_CONFIG: {
        PIECE_COUNT: 64,      // High Pressure: 64x64 Matrix
        PIECE_SIZE: 1024 * 8, // 8KB symbols
        SYSTEMATIC: false     // MANDATORY: Full Coded mode for S-Box stress
    },
    OVERHEAD: 4 
};

async function runUpperBoundProfile() {
    const { PIECE_COUNT, PIECE_SIZE } = CONFIG.ENCODER_CONFIG;
    const bytesPerGen = PIECE_COUNT * PIECE_SIZE;

    console.log(`=========================================`);
    console.log(`🚀 S-BOX UPPER BOUND PROFILER`);
    console.log(`=========================================`);
    console.log(`Loops:      ${CONFIG.ITERATIONS}`);
    console.log(`Generation: ${bytesPerGen / 1024} KB (${PIECE_COUNT} symbols)`);
    console.log(`Mode:       FULL CODED (No Systematic) 🧪`);
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
        const encoder = new BlockEncoder(rawData, CONFIG.GEN_ID, CONFIG.ENCODER_CONFIG);
        const stream = [];
        for (let j = 0; j < (PIECE_COUNT + CONFIG.OVERHEAD); j++) {
            stream.push(encoder.codedPiece());
        }
        stats.encodeMs += (performance.now() - t0);

        // 2. Decode Measurement
        const t1 = performance.now();
        const decoder = new BlockDecoder(CONFIG.ENCODER_CONFIG);
        
        let result = null;
        for (const piece of stream) {
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
        if (i % 10 === 0 && i > 0) process.stdout.write('█');
    }

    printReport(stats, bytesPerGen);
}

function printReport(s, bytesPerGen) {
    const totalBytes = s.total * bytesPerGen;
    const mbProcessed = totalBytes / (1024 * 1024);
    const totalMs = s.encodeMs + s.decodeMs;
    const totalTimeSec = totalMs / 1000;

    const nsPerByte = (totalMs * 1000000) / totalBytes;

    console.log(`\n\n--- 📊 S-BOX UPPER BOUND REPORT ---`);
    console.log(`Success Rate:      ${((s.success / s.total) * 100).toFixed(2)}%`);
    console.log(`Avg Encoding:      ${(s.encodeMs / s.total).toFixed(3)} ms`);
    console.log(`Avg Decoding:      ${(s.decodeMs / s.total).toFixed(3)} ms`);
    console.log(`------------------------------------------`);
    console.log(`Latency per Byte:  ${nsPerByte.toFixed(2)} ns/byte`);
    console.log(`Eff. Throughput:   ${(mbProcessed / totalTimeSec).toFixed(2)} MB/s`);
    console.log(`------------------------------------------\n`);
}

runUpperBoundProfile().catch(console.error);
