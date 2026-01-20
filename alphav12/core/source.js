/**
 * RLNC Source (Producer)
 * @warden-purpose Orchestrates data ingestion and encoding pipelines.
 * @warden-scope Core Implementation
 */
const EventEmitter = require('events');
const crypto = require('crypto');

const GenerationEncoder = require('../threading/generation_encoder');
const PacketSerializer = require('../network/packet_serializer');
const WorkerPool = require('../threading/worker_pool');
const NetworkSimulator = require('../network/network_simulator');
const UdpTransport = require('../network/udp_transport');
const SlidingWindow = require('../threading/sliding_window');
const SharedBufferPool = require('../utils/shared_buffer_pool');
const VisualDashboard = require('../utils/visual_dashboard');

class Source extends EventEmitter {
    constructor(data, config, filename, sourceHash) {
        super();
        this.data = data;
        this.config = config;
        this.filename = filename;
        this.sourceHash = sourceHash;

        this.ioPool = new SharedBufferPool(
            config.SYSTEM.POOL_SLOTS || 4096,
            config.TRANSCODE.PIECE_SIZE + 128
        );

        this.window = new SlidingWindow(config);
        this.watchdog = null;
        this.loop = null;
        this.globalSequence = 0;
        this.sessionId = crypto.createHash('md5').update(filename + Date.now()).digest().readUInt32BE(0);
    }

    async run() {
        return new Promise(async (resolve) => {
            const globalTimeout = (this.config.SYSTEM && this.config.SYSTEM.GLOBAL_TIMEOUT) || 60000;
            this.watchdog = setTimeout(() => {
                console.error(`\n[SOURCE] Global Timeout Reached. Aborting.`);
                this._finish(resolve);
            }, globalTimeout);

            const threads = this.config.SYSTEM.THREADS || 0;
            this.encoderPool = new WorkerPool(threads, 'encoder_worker.js', this.ioPool);

            const udp = new UdpTransport(this.ioPool);
            const netOptions = {
                lossRate: this.config.NETWORK.LOSS_RATE,
                delay: this.config.NETWORK.LATENCY,
                jitter: this.config.NETWORK.JITTER
            };
            this.transport = new NetworkSimulator(netOptions, udp);
            
            // Connect to configured peer
            this.transport.connect(this.config.NETWORK.PEER_ADDRESS || '127.0.0.1', this.config.NETWORK.PEER_PORT || 46642);

            this.enc = GenerationEncoder.create(this.data, this.config, this.encoderPool, this.window);
            this.config.TOTAL_GENS = this.enc.totalGenerations;
            this.window.setTotalGenerations(this.enc.totalGenerations);
            
            this.dash = new VisualDashboard(this.config, this.sourceHash, this.filename, this.data.length, 'source');

            this._wireComponents();

            const tickRate = this.config.SYSTEM.TICK_RATE || 10;
            const targetThroughputMB = this.config.SYSTEM.TARGET_THROUGHPUT_MB;
            const packetsPerTick = Math.ceil((targetThroughputMB * 1024 * 1024) / this.config.TRANSCODE.PIECE_SIZE / (1000 / tickRate));

            this.loop = setInterval(() => {
                if (!this.window.isFinished()) {
                    this.enc.produce(packetsPerTick);

                    // Unidirectional Logic: Slide window based on volume sent
                    if (this.config.NETWORK.UNIDIRECTIONAL) {
                        for (const genId of this.window.window) {
                            const gen = this.dash.generations.get(genId);
                            const targetRedundancy = this.config.NETWORK.REDUNDANCY || 1.2;
                            if (gen && gen.sent >= this.config.TRANSCODE.PIECE_COUNT * targetRedundancy) {
                                this.window.acknowledge(genId);
                                this.dash.updateGen(genId, { acked: true });
                            }
                        }
                    }
                }

                this.dash.render();

                if (this.window.isFinished()) {
                    clearInterval(this.loop);
                    this.dash.render();
                    setTimeout(() => this._finish(resolve), 1000);
                }
            }, tickRate);
        });
    }

    _wireComponents() {
        this.encoderPool.on('packet_shared', (slotIdx, length) => {
            const slotView = this.ioPool.getSlotView(slotIdx);
            
            // v2: Serialize directly into existing slot view with sequence/session
            const header = PacketSerializer.deserialize(slotView.subarray(0, length), this.config.PROTOCOL);
            if (header) {
                PacketSerializer.serializeTo(header, this.config.PROTOCOL, slotView, this.globalSequence++, this.sessionId);
                
                this.dash.initGen(header.genId, this.config.TRANSCODE.PIECE_COUNT);
                const gen = this.dash.generations.get(header.genId);
                if (gen) this.dash.updateGen(header.genId, { sent: gen.sent + 1 });
            }
            this.transport.send(slotIdx, length);
            this.dash.registerTraffic(length, 'tx');
        });

        this.encoderPool.on('packet', (buf) => {
            // Deprecated path, but hardening for compatibility
            const slotIdx = this.ioPool.acquireTX();
            if (slotIdx !== -1) {
                const slotView = this.ioPool.getSlotView(slotIdx);
                const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
                if (header) {
                    PacketSerializer.serializeTo(header, this.config.PROTOCOL, slotView, this.globalSequence++, this.sessionId);
                    this.transport.send(slotIdx, buf.length);
                }
            }
        });

        // Source might receive feedback (future expansion)
        this.transport.on('packet', (buf) => {
            // Handle NACKs / Boosts
        });
    }

    _finish(resolve) {
        if (this.watchdog) clearTimeout(this.watchdog);
        if (this.loop) clearInterval(this.loop);
        this.encoderPool.terminate();
        this.transport.close();
        resolve();
    }
}

module.exports = Source;
