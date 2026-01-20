/**
 * RLNC Sink (Consumer)
 * @warden-purpose Orchestrates packet reception and decoding pipelines.
 * @warden-scope Core Implementation
 */
const EventEmitter = require('events');
const crypto = require('crypto');

const GenerationDecoder = require('../threading/generation_decoder');
const PacketSerializer = require('../network/packet_serializer');
const WorkerPool = require('../threading/worker_pool');
const NetworkSimulator = require('../network/network_simulator');
const UdpTransport = require('../network/udp_transport');
const SharedBufferPool = require('../utils/shared_buffer_pool');
const VisualDashboard = require('../utils/visual_dashboard');

class Sink extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;

        this.ioPool = new SharedBufferPool(
            config.SYSTEM.POOL_SLOTS || 4096,
            config.TRANSCODE.PIECE_SIZE + 128
        );

        this.watchdog = null;
        this.loop = null;
        this.solvedGenerations = new Set();

        this.highestSequence = -1;
        this.receivedCount = 0;
        this.startingSequence = -1;

        this.lastRank = new Map(); // genId -> rank
        this.lastRankTime = new Map(); // genId -> timestamp
    }

    async run() {
        return new Promise(async (resolve) => {
            const globalTimeout = (this.config.SYSTEM && this.config.SYSTEM.GLOBAL_TIMEOUT) || 60000;
            this.watchdog = setTimeout(() => {
                console.error(`\n[SINK] Global Timeout Reached. Aborting.`);
                this._finish(resolve);
            }, globalTimeout);

            const threads = this.config.SYSTEM.THREADS || 0;
            this.decoderPool = new WorkerPool(threads, 'decoder_worker.js', this.ioPool);

            const udp = new UdpTransport(this.ioPool);
            const netOptions = {
                lossRate: this.config.NETWORK.LOSS_RATE,
                delay: this.config.NETWORK.LATENCY,
                jitter: this.config.NETWORK.JITTER
            };
            this.transport = new NetworkSimulator(netOptions, udp);
            
            // Listen on configured port
            await this.transport.listen(this.config.NETWORK.PORT || 46642);

            this.dec = GenerationDecoder.create(this.config, this.decoderPool);
            this.dash = new VisualDashboard(this.config, "Pending...", "IncomingStream", 0, 'sink');

            this._wireComponents();

            this.loop = setInterval(() => {
                // Calculate Loss (Gap Analysis)
                if (this.highestSequence !== -1) {
                    const expected = this.highestSequence - this.startingSequence + 1;
                    const loss = Math.max(0, ((expected - this.receivedCount) / expected) * 100);
                    
                    // Simple heuristic: Update all active ribbons with the global loss score
                    for (const id of this.dash.allIds) {
                        this.dash.updateGen(id, { loss });
                    }
                }

                this.dash.render();

                // Terminate if all expected generations are solved
                // Note: Sink needs to know totalGenerations from Metadata (Future Phase)
                if (this.config.TOTAL_GENS && this.solvedGenerations.size >= this.config.TOTAL_GENS) {
                    const reconstructed = this.dec.getReconstructedFile();
                    if (reconstructed) {
                        const finalHash = crypto.createHash('sha256').update(reconstructed).digest('hex');
                        this.dash.setFinalHash(finalHash);
                    }
                    this.dash.render();
                    clearInterval(this.loop);
                    setTimeout(() => this._finish(resolve), 1000);
                }
            }, this.config.SYSTEM.TICK_RATE || 100);
        });
    }

    _wireComponents() {
        const workerConfig = { ...this.config.PROTOCOL, ...this.config.TRANSCODE };

        const processHeader = (header) => {
            if (this.startingSequence === -1) this.startingSequence = header.sequence;
            if (header.sequence > this.highestSequence) this.highestSequence = header.sequence;
            this.receivedCount++;

            this.dash.initGen(header.genId, this.config.TRANSCODE.PIECE_COUNT);
            const gen = this.dash.generations.get(header.genId);
            if (gen) this.dash.updateGen(header.genId, { recv: gen.recv + 1 });
        };

        this.transport.on('packet_shared', (slotIdx, length) => {
            const slotView = this.ioPool.getSlotView(slotIdx);
            const header = PacketSerializer.deserialize(slotView.subarray(0, length), this.config.PROTOCOL);
            
            if (header) {
                processHeader(header);

                this.decoderPool.dispatch(header.genId, {
                    type: 'PROCESS_SLOT',
                    slotIdx,
                    config: workerConfig
                });
            } else {
                Atomics.store(this.ioPool.control, 3 + slotIdx, 0);
            }
            this.dash.registerTraffic(length, 'rx');
        });

        this.transport.on('packet', (buf) => {
            const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (header) {
                processHeader(header);

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

        this.decoderPool.on('solved', (id, data) => {
            this.solvedGenerations.add(id);
            this.dash.updateGen(id, { acked: true });
        });

        this.decoderPool.on('rank', (msg) => {
            const now = Date.now();
            const prevRank = this.lastRank.get(msg.genId) || 0;
            const prevTime = this.lastRankTime.get(msg.genId) || now - 1000;
            
            // Calculate Rank Velocity (Ranks per second)
            const deltaRank = msg.rank - prevRank;
            const deltaTime = (now - prevTime) / 1000;
            const rate = Math.max(0, deltaRank / (deltaTime || 1));

            this.dash.updateGen(msg.genId, { rank: msg.rank, rate });
            
            this.lastRank.set(msg.genId, msg.rank);
            this.lastRankTime.set(msg.genId, now);
        });
    }

    _finish(resolve) {
        if (this.watchdog) clearTimeout(this.watchdog);
        if (this.loop) clearInterval(this.loop);
        this.decoderPool.terminate();
        this.transport.close();
        resolve();
    }
}

module.exports = Sink;
