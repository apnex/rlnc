const path = require('path');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');

class WorkerPool extends EventEmitter {
    constructor(numThreads = 4) {
        super();
        this.workers = [];
        this.nextWorkerIdx = 0;

        console.log(`[WorkerPool] Spawning ${numThreads} threads...`);

        for (let i = 0; i < numThreads; i++) {
	    const w = new Worker(path.join(__dirname, 'encoder_worker.js'));
            
            w.on('message', (msg) => {
                if (msg.type === 'PACKET') {
                    const safeBuffer = Buffer.from(msg.payload);
                    this.emit('packet', safeBuffer);
                } 
            });
            
            w.on('error', (err) => console.error(`Worker ${i} error:`, err));
            this.workers.push(w);
        }
    }

    addJob(genId, data, config) {
        const worker = this.workers[this.nextWorkerIdx];
        worker.postMessage({ type: 'INIT', genId, data, config });
        this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    }

    produce(totalPackets, protocolConfig) {
        const perWorker = Math.ceil(totalPackets / this.workers.length);
        for (const w of this.workers) {
            w.postMessage({ type: 'PRODUCE', limit: perWorker, protocolConfig });
        }
    }

    boost(genId, count) {
        for (const w of this.workers) w.postMessage({ type: 'BOOST', genId, count });
    }

    ack(genId) {
        for (const w of this.workers) w.postMessage({ type: 'ACK', genId });
    }

    terminate() {
        for (const w of this.workers) w.terminate();
    }
}
module.exports = WorkerPool;
