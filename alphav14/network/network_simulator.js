const ITransport = require('./transport');

/**
 * Network Simulator Middleware (CON-004 Wrapper Pattern)
 * Hardened for Symmetric Zero-Copy Operation.
 */
class NetworkSimulator extends ITransport {
    constructor(options = {}, innerTransport = null) {
        super();
        this.lossRate = options.lossRate || 0.0;
        this.delay = options.delay || 10; 
        this.jitter = options.jitter || 0;
        this.innerTransport = innerTransport;
        this.pool = innerTransport ? innerTransport.pool : null;
        
        this.stats = { 
            txSent: 0, 
            txDropped: 0, 
            rxReceived: 0, 
            rxDropped: 0,
            delivered: 0, 
            txBytes: 0, 
            rxBytes: 0 
        };

        if (this.innerTransport) {
            // Support both standard and shared packets
            this.innerTransport.on('packet', (packet) => {
                this._injectImpairment(packet, 'rx');
            });

            this.innerTransport.on('packet_shared', (slotIdx, length) => {
                this._injectImpairment({ slotIdx, length }, 'rx_shared');
            });
        }
    }

    listen(port) {
        if (this.innerTransport) return this.innerTransport.listen(port);
    }

    connect(address, port) {
        if (this.innerTransport) return this.innerTransport.connect(address, port);
    }

    /**
     * Hardened Send: Supports both legacy Buffer and shared slot indices.
     */
    send(packetOrOffset, length) {
        this.stats.txSent++;
        this.stats.txBytes += (length || 0);
        const mode = typeof packetOrOffset === 'number' ? 'tx_shared' : 'tx';
        this._injectImpairment(packetOrOffset, mode, length);
    }

    _injectImpairment(data, mode, length) {
        const isRx = mode.startsWith('rx');
        if (isRx) {
            this.stats.rxReceived++;
            this.stats.rxBytes += (length || data.length || 0);
        }
        
        // v12: Only apply impairment on egress (TX) to avoid "Double Loss" in Unified mode.
        // In standalone Source/Sink modes, this still correctly simulates a 10% loss path.
        if (!isRx && Math.random() < this.lossRate) {
            this.stats.txDropped++;
            
            if (this.pool) {
                const slotIdx = mode === 'tx_shared' ? data : data.slotIdx;
                Atomics.store(this.pool.control, 3 + slotIdx, 0);
            }
            return; 
        }

        const jitterCalc = (Math.random() * this.jitter * 2) - this.jitter;
        const actualDelay = Math.max(0, this.delay + jitterCalc);

        setTimeout(() => {
            this.stats.delivered++;
            if (mode === 'tx') {
                if (this.innerTransport) this.innerTransport.send(data, length);
                else this.emit('packet', data);
            } else if (mode === 'tx_shared') {
                // Forward the slot index without copying
                if (this.innerTransport) this.innerTransport.send(data, length);
                else this.emit('packet_shared', data, length);
            } else if (mode === 'rx_shared') {
                this.emit('packet_shared', data.slotIdx, data.length);
            } else {
                this.emit('packet', data);
            }
        }, actualDelay);
    }

    getStats() {
        return {
            ...this.stats,
            txMB: (this.stats.txBytes || 0) / (1024 * 1024),
            rxMB: (this.stats.rxBytes || 0) / (1024 * 1024)
        };
    }

    close() {
        if (this.innerTransport) this.innerTransport.close();
        super.close();
    }
}

module.exports = NetworkSimulator;