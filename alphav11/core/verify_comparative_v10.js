const crypto = require('node:crypto');

// v8 Legacy Components
const BlockEncoderLegacy = require('./block_encoder_v8');
const BlockDecoderLegacy = require('./block_decoder_v8');

// Mainline (ex-v11) Components
const BlockEncoderMainline = require('./block_encoder');
const BlockDecoderMainline = require('./block_decoder');

const CONFIG = {
    ITERATIONS: 300,
    ENCODER_CONFIG: {
        PIECE_COUNT: 64,      // 64x64 Matrix
        PIECE_SIZE: 1024 * 8, // 8KB symbols
        SYSTEMATIC: false     // Full Coded mode for pure math profiling
    },
    OVERHEAD: 2
};

async function profile(variantName, solveMethodName) {
    const { PIECE_COUNT, PIECE_SIZE } = CONFIG.ENCODER_CONFIG;
    const bytesPerGen = PIECE_COUNT * PIECE_SIZE;
    
    const stats = { total: 0, success: 0, encodeMs: 0, decodeMs: 0 };

    for (let i = 0; i < CONFIG.ITERATIONS; i++) {
        const rawData = crypto.randomBytes(bytesPerGen);
        const sourceHash = crypto.createHash('sha256').update(rawData).digest('hex');

        // Use Mainline Encoder for all optimized variants to isolate Decoder performance
        const EncoderClass = variantName === 'v8 Legacy' ? BlockEncoderLegacy : BlockEncoderMainline;
        const DecoderClass = variantName === 'v8 Legacy' ? BlockDecoderLegacy : BlockDecoderMainline;

        // Encode
        const t0 = performance.now();
        const encoder = variantName === 'v8 Legacy' 
            ? new EncoderClass(rawData, 100, CONFIG.ENCODER_CONFIG)
            : new EncoderClass(rawData, CONFIG.ENCODER_CONFIG);
            
        const stream = [];
        for (let j = 0; j < (PIECE_COUNT + CONFIG.OVERHEAD); j++) {
            if (variantName === 'v8 Legacy') {
                stream.push(encoder.codedPiece());
            } else {
                const raw = encoder.codedPiece();
                stream.push(new CodedPiece(100, raw.coeffs, raw.data));
            }
        }
        stats.encodeMs += (performance.now() - t0);

        // Decode
        const t1 = performance.now();
        const decoder = new DecoderClass(CONFIG.ENCODER_CONFIG);
        
        // Inject the specific experimental method into the matrix instance
        if (variantName !== 'v8 Legacy' && solveMethodName) {
            decoder.matrix.solve = decoder.matrix[solveMethodName].bind(decoder.matrix);
        }

        let result = null;
        for (const piece of stream) {
            if (decoder.addPiece(piece)) {
                result = decoder.getData();
                break; 
            }
        }
        stats.decodeMs += (performance.now() - t1);

        if (result) {
            const resultHash = crypto.createHash('sha256').update(result).digest('hex');
            if (sourceHash !== resultHash) {
                console.error(`\n[FATAL] Hash mismatch in ${variantName}! Implementation is corrupted.`);
                process.exit(1);
            }
            stats.success++;
        }
        stats.total++;
    }

    return {
        variantName,
        avgEncode: stats.encodeMs / stats.total,
        avgDecode: stats.decodeMs / stats.total,
        throughput: (stats.total * bytesPerGen / (1024 * 1024)) / ((stats.encodeMs + stats.decodeMs) / 1000),
        success: (stats.success / stats.total) * 100
    };
}

async function run() {
    console.log(`=========================================`);
    console.log(`🚀 ALPHAv11 4-WAY COMPARATIVE PROFILER`);
    console.log(`=========================================`);
    console.log(`DEBUG: crypto type = ${typeof crypto}`);
    if (typeof crypto === 'object') console.log(`DEBUG: crypto keys = ${Object.keys(crypto).join(', ')}`);
    console.log(`Iterations: ${CONFIG.ITERATIONS}`);
    console.log(`Config:     64 symbols x 8KB (Full Coded)`);
    console.log(`=========================================\n`);

    const results = [];
    
    console.log("1/4 Baselining v8 Legacy...");
    results.push(await profile("v8 Legacy", null));

    console.log("2/4 Profiling Mainline (Vectorized)...");
    results.push(await profile("Mainline Vector", "solve_vectorized"));

    console.log("3/4 Profiling Mainline (Fused)...");
    results.push(await profile("Mainline Fused", "solve_fused"));

    console.log("4/4 Profiling Mainline (Direct)...");
    results.push(await profile("Mainline Direct", "solve_direct"));

    console.log(`\n--- 📊 4-WAY COMPARATIVE PERFORMANCE REPORT ---`);
    console.log(`Variant         | Avg Decode | Throughput | Delta (TP)`);
    console.log(`----------------|------------|------------|-----------`);
    
    const legacy = results[0];
    results.forEach(res => {
        const tpDelta = ((res.throughput / legacy.throughput) - 1) * 100;
        console.log(`${res.variantName.padEnd(15)} | ${res.avgDecode.toFixed(2).padEnd(10)} | ${res.throughput.toFixed(2).padEnd(10)} | ${tpDelta > 0 ? '+' : ''}${tpDelta.toFixed(1)}%`);
    });
    console.log(`---------------------------------------------------------\n`);
}

run().catch(console.error);
