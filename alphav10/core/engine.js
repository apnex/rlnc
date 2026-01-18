const EventEmitter = require('events');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GenerationEncoder = require('../threading/generation_encoder');
const GenerationDecoder = require('../threading/generation_decoder');
const PacketSerializer = require('../network/packet_serializer');
const WorkerPool = require('../threading/worker_pool');
const NetworkSimulator = require('../network/network_simulator');
const VisualDashboard = require('../utils/visual_dashboard');

class Engine extends EventEmitter {
    constructor(data, config, filename, sourceHash) {
        super();
        this.data = data;
        this.config = config;
        this.filename = filename;
        this.sourceHash = sourceHash;
        this.solvedGenerations = new Set();
        this.watchdog = null;
        this.loop = null;
    }

    async run() {
        return new Promise((resolve) => {
            // --- Global Watchdog ---
            const globalTimeout = (this.config.SYSTEM && this.config.SYSTEM.GLOBAL_TIMEOUT) || 60000;
            this.watchdog = setTimeout(() => {
                console.error(`\n[FATAL] Global Timeout Reached (${globalTimeout}ms). Aborting session.`);
                this._finish(resolve);
            }, globalTimeout);

            // Initialize Components
            const threads = (this.config.SYSTEM && this.config.SYSTEM.THREADS !== undefined) ? this.config.SYSTEM.THREADS : 0;
            this.encoderPool = new WorkerPool(threads, 'encoder_worker.js');
            this.decoderPool = new WorkerPool(threads, 'decoder_worker.js');

            this.enc = GenerationEncoder.create(this.data, this.config, this.encoderPool);
            this.config.TOTAL_GENS = this.enc.totalGenerations;
            this.dec = GenerationDecoder.create(this.config, this.decoderPool);
            this.dash = new VisualDashboard(this.config, this.sourceHash, this.filename, this.data.length);

            const netOptions = {
                lossRate: this.config.NETWORK.LOSS_RATE,
                delay: this.config.NETWORK.LATENCY,
                jitter: this.config.NETWORK.JITTER
            };
            
            // v8 Velocity: Modular Transport initialization
            this.forwardNet = new NetworkSimulator(netOptions);
            this.returnNet = new NetworkSimulator(netOptions);

            // Wiring
            this._wireComponents();

            // Run Loop
            const targetThroughputMB = this.config.SYSTEM.TARGET_THROUGHPUT_MB;
            const packetSize = this.config.TRANSCODE.PIECE_SIZE;
            const tickRate = this.config.SYSTEM.TICK_RATE; 
            const packetsPerTick = Math.ceil((targetThroughputMB * 1024 * 1024) / packetSize / (1000 / tickRate));

            this.loop = setInterval(() => {
                for (const id of this.enc.window) {
                    this.dash.initGen(id, this.config.TRANSCODE.PIECE_COUNT);
                }
                if (!this.enc.isFinished()) {
                    this.enc.produce(packetsPerTick);
                }
                this.dash.render();
                if (this.enc.isFinished() && this.enc.window.size === 0) {
                    clearInterval(this.loop);
                    setTimeout(() => this._finish(resolve), 1000); 
                }
            }, tickRate);
        });
    }

    _wireComponents() {
        // Encoder -> Network
        this.enc.on('packet', (buf) => {
            const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (!header) return;
            this.dash.initGen(header.genId, this.config.TRANSCODE.PIECE_COUNT);
            this.dash.updateGen(header.genId, { sent: this.dash.generations.get(header.genId).sent + 1 });
            this.dash.addGlobalStat('totalPackets');
            this.dash.registerTraffic(buf.length, 'tx');
            this.forwardNet.send(buf);
        });

        // Network -> Decoder
        this.forwardNet.on('packet', (buf) => {
            const pRecv = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (pRecv) {
                if (this.solvedGenerations.has(pRecv.genId)) {
                    this._sendAck(pRecv.genId); 
                    return; 
                }
                const gen = this.dash.generations.get(pRecv.genId);
                if (gen) this.dash.updateGen(pRecv.genId, { recv: gen.recv + 1 });
                this.dash.registerTraffic(buf.length, 'rx');
                this.dec.addPiece(pRecv);
            }
        });

        // Decoder -> Acks
        this.dec.on('generation_ready', (id) => {
            this.solvedGenerations.add(id); 
            this._sendAck(id);
        });

        // Network (Return) -> Encoder
        this.returnNet.on('packet', (ackBuf) => {
            const id = ackBuf.readUInt32BE(0);
            if (!this.enc.ackedGenerations.has(id)) {
                this.dash.updateGen(id, { acked: true });
                this.enc.acknowledge(id); 
            }
        });

        // Encoder Watchdog
        this.enc.on('watchdog_slide', (id) => {
            const gen = this.dash.generations.get(id);
            this.dash.updateGen(id, { boosted: true, boostCount: (gen ? gen.boostCount : 0) + 1 });
            this.dash.addGlobalStat('boosts');
        });
    }

    _sendAck(genId) {
        const ackBuf = Buffer.alloc(4);
        ackBuf.writeUInt32BE(genId, 0);
        this.returnNet.send(ackBuf);
    }

    _finish(resolve) {
        if (this.watchdog) clearTimeout(this.watchdog);
        if (this.loop) clearInterval(this.loop);
        
        this.enc.terminate(); 
        this.dec.terminate();
        
        if (this.forwardNet) this.forwardNet.close();
        if (this.returnNet) this.returnNet.close();
        
        const result = this.dec.getReconstructedFile();
        let finalHash = "FAILURE";
        if (result) {
            const cleanResult = result.slice(0, this.data.length);
            finalHash = crypto.createHash('sha256').update(cleanResult).digest('hex');
            if (this.config.DATA.INPUT_PATH && fs.existsSync(this.config.DATA.INPUT_PATH)) {
                const outName = `restored_${path.basename(this.filename)}`;
                fs.writeFileSync(outName, cleanResult);
            }
        }
        this.dash.setFinalHash(finalHash);
        this.dash.render();
        console.log("\n=== SESSION COMPLETE ===");
        resolve();
    }
}

module.exports = Engine;
