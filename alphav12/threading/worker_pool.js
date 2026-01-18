const path = require('path');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');
const os = require('os');

const SharedBufferPool = require('../utils/shared_buffer_pool');

class WorkerPool extends EventEmitter {
    constructor(numThreads = 0, scriptName = 'encoder_worker.js', sharedPool = null) {
        super();
        this.workers = [];
        this.nextWorkerIdx = 0;

        // v10 Optimization: Centralized Shared Memory
        if (!sharedPool) {
            throw new Error("[WorkerPool] A SharedBufferPool instance is required for v10 operation.");
        }
        this.pool = sharedPool;

        // v8 Velocity: Adaptive Hardware Concurrency
        if (numThreads === 0) {
            numThreads = os.cpus().length;
        }

        console.log(`[WorkerPool] Spawning ${numThreads} ${scriptName} threads...`);

        for (let i = 0; i < numThreads; i++) {
            const w = new Worker(path.join(__dirname, scriptName), {
                workerData: {
                    controlBuffer: this.pool.controlBuffer,
                    dataBuffer: this.pool.dataBuffer,
                    numSlots: this.pool.numSlots,
                    slotSize: this.pool.slotSize
                }
            });
            w.on('message', (msg) => {
                if (msg.type === 'PACKET') {
                    const safeView = Buffer.from(msg.payload);
                    this.emit('packet', safeView);
                } else if (msg.type === 'PACKET_SHARED') {
                    // v10: Packet is in the Shared Pool. 
                    // Main thread can send it directly from the SAB view.
                    const slotView = this.pool.getSlotView(msg.slotIdx);
                    const packetView = slotView.subarray(0, msg.length);
                    this.emit('packet', packetView);
                    
                    // Release slot after emission (optional, or wait for TX)
                    Atomics.store(this.pool.control, 3 + msg.slotIdx, 0);
                } else if (msg.type === 'SOLVED') {
                    this.emit('solved', msg.genId, Buffer.from(msg.data));
                } else if (msg.type === 'STATS') {
                    this.emit('stats', msg.stats);
                } else if (msg.type === 'RANK_UPDATE') {
                    this.emit('rank', msg);
                }
            });

            w.on('error', (err) => console.error(`Worker ${i} [${scriptName}] error:`, err));
            this.workers.push(w);
        }
    }

    // v8 Optimization: Sharded Dispatch for stateful workers (Decoders)
    dispatch(genId, msg, transferList = []) {
        const idx = genId % this.workers.length;
        this.workers[idx].postMessage(msg, transferList);
    }

    addJob(genId, data, config) {
        const worker = this.workers[this.nextWorkerIdx];

        // v7 Optimization: ZERO-COPY SUBMISSION
        // We attempt to transfer ownership of the 'data' buffer to the worker.
        // This avoids cloning the generation data (which is the heaviest copy in the system).
        let transferList = [];

        // Check if the buffer is eligible for transfer (occupies full underlying memory)
        if (data.buffer && data.byteLength === data.buffer.byteLength) {
             transferList.push(data.buffer);
        } else {
            // If data is a view (e.g., a slice of a larger file), we cannot transfer
            // just the view without detaching the whole file.
            // In this specific case, Node.js will fallback to cloning (copying) the data.
            // Ideally, 'data' passed here should be a dedicated buffer for max performance.
        }

        worker.postMessage({
            type: 'INIT',
            genId,
            data,
            config
        }, transferList); // <--- Transfer List for Input

        this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    }

    produce(totalPackets, protocolConfig, budgets = {}) {
        const perWorker = Math.ceil(totalPackets / this.workers.length);
        const workerCount = this.workers.length;

	for (let i = 0; i < workerCount; i++) {
		const workerBudgets = {};
		// Proportional split logic
            	for (const [id, totalBudget] of Object.entries(budgets)) {
			const baseShare = Math.floor(totalBudget / workerCount);
			const remainder = (i === 0) ? (totalBudget % workerCount) : 0;
	                workerBudgets[id] = baseShare + remainder;
            	}
        	this.workers[i].postMessage({
			type: 'PRODUCE',
			limit: perWorker,
			protocolConfig,
			budgets: workerBudgets // Pass fractional budget to each worker
		});
        }
    }

    boost(genId, count, protocolConfig) {
        for (const w of this.workers) w.postMessage({ type: 'BOOST', genId, count, protocolConfig });
    }

    ack(genId) {
        for (const w of this.workers) w.postMessage({ type: 'ACK', genId });
    }

    terminate() {
        for (const w of this.workers) w.terminate();
    }
}
module.exports = WorkerPool;
