const WorkerPool = require('../threading/worker_pool');
const config = require('../config');

const pool = new WorkerPool(4);
const data = Buffer.alloc(config.TRANSCODE.PIECE_SIZE * config.TRANSCODE.PIECE_COUNT, 'A');

console.log("Starting Thread Verification...");

pool.on('packet', (buf) => {
    console.log(`[PASS] Received Packet: ${buf.length} bytes`);
    pool.terminate();
    process.exit(0);
});

// Configure Protocol for Worker
const workerConfig = {
    PIECE_COUNT: config.TRANSCODE.PIECE_COUNT,
    PIECE_SIZE: config.TRANSCODE.PIECE_SIZE,
    SYSTEMATIC: true
};

pool.addJob(1, data, workerConfig);
pool.produce(1, config.PROTOCOL, { 1: 1 });
