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

class Sink extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;

        this.ioPool = new SharedBufferPool(
            config.SYSTEM.POOL_SLOTS || 4096,
            config.TRANSCODE.PIECE_SIZE + config.TRANSCODE.PIECE_COUNT + 32
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

            this._wireComponents();

            this.loop = setInterval(() => {
                // Terminate if all expected generations are solved
                if (this.config.TOTAL_GENS && this.solvedGenerations.size >= this.config.TOTAL_GENS) {
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
        };

        this.transport.on('packet_shared', (slotIdx, length) => {
            const slotView = this.ioPool.getSlotView(slotIdx);
            const header = PacketSerializer.deserialize(slotView.subarray(0, length), this.config.PROTOCOL);
            
            if (header) {
                processHeader(header);
                this.dec.addPieceShared(slotIdx, length, header);
            } else {
                Atomics.store(this.ioPool.control, 3 + slotIdx, 0);
            }
        });

        this.transport.on('packet', (buf) => {
            const header = PacketSerializer.deserialize(buf, this.config.PROTOCOL);
            if (header) {
                processHeader(header);
                this.dec.addPiece(buf, header);
            }
        });

        this.decoderPool.on('solved', (id, data) => {
            this.solvedGenerations.add(id);
        });

        this.decoderPool.on('rank', (msg) => {
            this.dec.ranks.set(msg.genId, msg.rank);
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
