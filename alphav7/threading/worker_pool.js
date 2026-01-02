const path = require('path');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');

class WorkerPool extends EventEmitter {
    constructor(numThreads = 4) {
        super();
        this.workers = [];
        this.nextWorkerIdx = 0;

        console.log(`[WorkerPool] Spawning ${numThreads} v7 threads (Zero-Copy Enabled)...`);

        for (let i = 0; i < numThreads; i++) {
            const w = new Worker(path.join(__dirname, 'encoder_worker.js'));
            w.on('message', (msg) => {
                if (msg.type === 'PACKET') {
                    // v7 Optimization: ZERO-COPY RECEIVE
                    // msg.payload is an ArrayBuffer transferred from the worker.
                    // Buffer.from(ArrayBuffer) creates a view, NOT a copy.
                    // This is an O(1) operation.
                    const safeView = Buffer.from(msg.payload);
                    this.emit('packet', safeView);
                } else if (msg.type === 'STATS') {
                    this.emit('stats', msg.stats);
                }
            });

            w.on('error', (err) => console.error(`Worker ${i} error:`, err));
            this.workers.push(w);
        }
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

    produce(totalPackets, protocolConfig, budgets) {
        const perWorker = Math.ceil(totalPackets / this.workers.length);
        const workerCount = this.workers.length;

        for (const w of this.workers) {
		const workerBudgets = {};
		// Proportional split logic
            	for (const [id, totalBudget] of Object.entries(budgets)) {
                	// We use ceil to ensure we don't round down to zero on small budgets
                	workerBudgets[id] = Math.ceil(totalBudget / workerCount);
            	}
        	w.postMessage({
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
