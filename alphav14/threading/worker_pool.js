/**
 * Threaded Worker Management - AETHER NATIVE
 * @warden-purpose Orchestrate parallel "Born Blind" workers via the Aether Backplane.
 * @warden-scope Threading / Parallel Physics
 */
const path = require('path');
const { Worker } = require('worker_threads');
const EventEmitter = require('events');
const os = require('os');

class WorkerPool extends EventEmitter {
    /**
     * @param {AetherBackplane} backplane - The sovereign backplane.
     * @param {number} numThreads - Number of parallel workers.
     * @param {string} scriptPath - Relative path to the worker shell.
     */
    constructor(backplane, numThreads = 0, scriptPath = './coder_worker.js') {
        super();
        this.pcb = backplane;
        this.workers = [];
        const threadCount = numThreads || os.cpus().length;

        console.log(`[WorkerPool] Spawning ${threadCount} Aether-native threads...`);

        for (let i = 0; i < threadCount; i++) {
            const w = new Worker(path.join(__dirname, scriptPath), {
                workerData: {
                    sab: this.pcb.sab,
                    // Note: No SESSION_ID passed. Workers are "Born Blind".
                }
            });

            w.on('error', (err) => {
                console.error(`[WorkerPool] Worker ${i} error:`, err);
                this.emit('error', err);
            });

            w.on('exit', (code) => {
                if (code !== 0) console.error(`[WorkerPool] Worker ${i} exited with code ${code}`);
            });

            this.workers.push(w);
        }
    }

    /**
     * Broadcasts a signal to all workers via the Backplane (Pillar 1).
     * @param {number} signal - The signal value (e.g., START=1).
     */
    broadcast(signal) {
        // In Aether-native mode, the Hub writes to individual session slots.
        // The WorkerPool remains a passive lifecycle manager.
    }

    terminate() {
        for (const w of this.workers) w.terminate();
    }
}

module.exports = WorkerPool;
