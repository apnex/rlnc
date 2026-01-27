/**
 * UDP Data Transport
 * @warden-purpose High-throughput UDP-based data transit using dgram.
 * @warden-scope Networking
 */
const { Worker } = require('worker_threads');
const path = require('path');
const ITransport = require('./transport');

/**
 * PRODUCTION-GRADE UDP TRANSPORT (CON-004)
 * Isolated ingest via Worker Thread.
 */
class UdpTransport extends ITransport {
    constructor(pool) {
        super();
        this.pool = pool;
        this.peer = null;

        if (!pool) {
            throw new Error("[UdpTransport] SharedBufferPool required for zero-copy operation.");
        }

        this.worker = new Worker(path.join(__dirname, 'udp_worker.js'), {
            workerData: {
                controlBuffer: pool.controlBuffer,
                dataBuffer: pool.dataBuffer,
                numSlots: pool.numSlots,
                slotSize: pool.slotSize
            }
        });

        this.worker.on('message', (msg) => {
            if (msg.type === 'PACKET') {
                // Internal relay to ITransport interface
                // We emit the slot index and length to allow zero-copy downstream
                this.emit('packet_shared', msg.slotIdx, msg.length);
            } else if (msg.type === 'ERROR') {
                console.error('[UDP Worker] Error:', msg.error);
            } else if (msg.type === 'BOUND') {
                this.port = msg.address.port;
                console.log(`[UDP] Listening on ${msg.address.address}:${msg.address.port}`);
                if (this._resolveBind) this._resolveBind();
            }
        });
    }

    listen(port) {
        return new Promise((resolve) => {
            this._resolveBind = resolve;
            this.worker.postMessage({ type: 'BIND', port });
        });
    }

    connect(address, port) {
        this.peer = { address, port };
        console.log(`[UDP] Connected to peer at ${address}:${port}`);
    }

    /**
     * Sends a packet.
     * Supports legacy Buffer or Shared Slot Index.
     */
    send(packet, length) {
        if (!this.peer) return;
        this.worker.postMessage({ 
            type: 'SEND', 
            packet, 
            length,
            port: this.peer.port, 
            address: this.peer.address 
        });
    }

    close() {
        this.worker.terminate();
        super.close();
    }
}

module.exports = UdpTransport;