const EventEmitter = require('events');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GenerationEncoder = require('../threading/generation_encoder');
const GenerationDecoder = require('../threading/generation_decoder');
const PacketSerializer = require('../network/packet_serializer');
const WorkerPool = require('../threading/worker_pool');
const NetworkSimulator = require('../network/network_simulator');
const UdpTransport = require('../network/udp_transport');
const LoopbackTransport = require('../network/loopback_transport');
const SlidingWindow = require('../threading/sliding_window');
const SharedBufferPool = require('../utils/shared_buffer_pool');
const VisualDashboard = require('../utils/visual_dashboard');

/**
 * RLNC v11 UNIFIED ENGINE (CON-004)
 * Orchestrates Zero-Copy UDP Transport and Shared Memory Threading.
 */
class Engine extends EventEmitter {
    constructor(data, config, filename, sourceHash) {
        super();
        this.data = data;
        this.config = config;
        this.filename = filename;
        this.sourceHash = sourceHash;
        
        // 1. Shared Data Plane
        this.ioPool = new SharedBufferPool(
            config.SYSTEM.POOL_SLOTS || 4096, 
            config.TRANSCODE.PIECE_SIZE + 128 // Padding for Header
        );

        // 2. Orchestration
        this.window = new SlidingWindow(config);
        this.solvedGenerations = new Set();
        this.watchdog = null;
        this.loop = null;

        this.lastRank = new Map();
        this.lastRankTime = new Map();
    }

    async run() {
        return new Promise(async (resolve) => {
            const globalTimeout = (this.config.SYSTEM && this.config.SYSTEM.GLOBAL_TIMEOUT) || 60000;
            this.watchdog = setTimeout(() => {
                console.error(`\n[FATAL] Global Timeout Reached. Aborting.`);
                this._finish(resolve);
            }, globalTimeout);

            // 3. Threading (Shared Memory Aware)
            const threads = this.config.SYSTEM.THREADS || 0;
            
            this.encoderPool = new WorkerPool(threads, 'encoder_worker.js', this.ioPool);
            this.decoderPool = new WorkerPool(threads, 'decoder_worker.js', this.ioPool);

            // 4. Transport Selection (Wrapper Pattern)
            const udp = new UdpTransport(this.ioPool);
            const netOptions = {
                lossRate: this.config.NETWORK.LOSS_RATE,
                delay: this.config.NETWORK.LATENCY,
                jitter: this.config.NETWORK.JITTER
            };
            
            // Sim-in-Path: Wrap the UDP transport with impairment simulator
            this.transport = new NetworkSimulator(netOptions, udp);
            await this.transport.listen(0);
            this.transport.connect('127.0.0.1', udp.port);

            // 5. Workers & Logic
            this.enc = GenerationEncoder.create(this.data, this.config, this.encoderPool, this.window);
            this.config.TOTAL_GENS = this.enc.totalGenerations;
            this.window.setTotalGenerations(this.enc.totalGenerations);
            this.dec = GenerationDecoder.create(this.config, this.decoderPool);
            this.dash = new VisualDashboard(this.config, this.sourceHash, this.filename, this.data.length);

            this._wireComponents();

            // Run Loop
            const tickRate = this.config.SYSTEM.TICK_RATE || 10;
            const targetThroughputMB = this.config.SYSTEM.TARGET_THROUGHPUT_MB;
            const packetsPerTick = Math.ceil((targetThroughputMB * 1024 * 1024) / this.config.TRANSCODE.PIECE_SIZE / (1000 / tickRate));

            this.loop = setInterval(() => {
                const now = Date.now();
                const timeout = this.config.WINDOW.TIMEOUT || 1000;

                for (const id of this.window.window) {
                    this.dash.initGen(id, this.config.TRANSCODE.PIECE_COUNT);
                    
                    // Watchdog & Boost
                    const lastTime = this.lastRankTime.get(id) || now;
                    if (now - lastTime > timeout && !this.solvedGenerations.has(id)) {
                        this.encoderPool.boost(id, 5, this.config.PROTOCOL);
                        this.lastRankTime.set(id, now); 
                        const gen = this.dash.generations.get(id);
                        if (gen) {
                            this.dash.updateGen(id, { boosted: true, boostCount: (gen.boostCount || 0) + 1 });
                            this.dash.addGlobalStat('boosts', 1);
                        }
                    }
                }

                if (!this.window.isFinished()) {
                    this.enc.produce(packetsPerTick);
                }

                this.dash.render();

                if (this.window.isFinished()) {
                    clearInterval(this.loop);
                    const reconstructed = this.dec.getReconstructedFile();
                    if (reconstructed) {
                        const finalHash = crypto.createHash('sha256').update(reconstructed).digest('hex');
                        this.dash.setFinalHash(finalHash);
                    }
                    this.dash.render();
                    setTimeout(() => this._finish(resolve), 1000); 
                }
            }, tickRate);
        });
    }

    _wireComponents() {
        const workerConfig = { ...this.config.PROTOCOL, ...this.config.TRANSCODE };

        // v11: Handle Shared Packets (Zero-Copy)
        this.transport.on('packet_shared', (slotIdx, length) => {
            const slotView = this.ioPool.getSlotView(slotIdx);
            const header = PacketSerializer.deserialize(slotView.subarray(0, length), this.config.PROTOCOL);
            
            if (header) {
                const gen = this.dash.generations.get(header.genId);
                if (gen) this.dash.updateGen(header.genId, { recv: gen.recv + 1 });

                this.decoderPool.dispatch(header.genId, {
                    type: 'PROCESS_SLOT',
                    slotIdx,
                    config: workerConfig
                });
            } else {
                // Invalid or dropped packet, release slot
                Atomics.store(this.ioPool.control, 3 + slotIdx, 0);
            }
            this.dash.registerTraffic(length, 'rx');
        });

        // Legacy/Simulator Packet Ingest
        this.transport.on('packet', (buf) => {
            const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (header) {
                const gen = this.dash.generations.get(header.genId);
                if (gen) this.dash.updateGen(header.genId, { recv: gen.recv + 1 });

                const slotIdx = this.ioPool.acquireRX();
                if (slotIdx !== -1) {
                    const slotView = this.ioPool.getSlotView(slotIdx);
                    slotView.set(buf);
                    this.decoderPool.dispatch(header.genId, {
                        type: 'PROCESS_SLOT',
                        slotIdx,
                        config: workerConfig
                    });
                }
            }
            this.dash.registerTraffic(buf.length, 'rx');
        });

        this.encoderPool.on('packet', (buf) => {
            const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (header) {
                this.dash.initGen(header.genId, this.config.TRANSCODE.PIECE_COUNT);
                const gen = this.dash.generations.get(header.genId);
                if (gen) this.dash.updateGen(header.genId, { sent: gen.sent + 1 });
            }
            this.transport.send(buf);
            this.dash.registerTraffic(buf.length, 'tx');
        });

        this.decoderPool.on('solved', (id, data) => {
            this.window.markSolved(id);
            this.window.acknowledge(id); 
            this.solvedGenerations.add(id);
            this.dash.updateGen(id, { acked: true });
        });

        this.decoderPool.on('rank', (msg) => {
            this.dash.updateGen(msg.genId, { rank: msg.rank, boosted: false });
            this.lastRank.set(msg.genId, msg.rank);
            this.lastRankTime.set(msg.genId, Date.now());
        });
    }

    _finish(resolve) {
        if (this.watchdog) clearTimeout(this.watchdog);
        if (this.loop) clearInterval(this.loop);
        this.encoderPool.terminate();
        this.decoderPool.terminate();
        this.transport.close();
        resolve();
    }
}

module.exports = Engine;