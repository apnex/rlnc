const ITransport = require('./transport');

/**
 * Network Simulator Middleware (CON-004 Wrapper Pattern)
 */
class NetworkSimulator extends ITransport {
    constructor(options = {}, innerTransport = null) {
        super();
        this.lossRate = options.lossRate || 0.0;
        this.delay = options.delay || 10; 
        this.jitter = options.jitter || 0;
        this.innerTransport = innerTransport;
        
        this.stats = { sent: 0, dropped: 0, delivered: 0 };

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

    send(packet, length) {
        this.stats.sent++;
        this._injectImpairment(packet, 'tx', length);
    }

    _injectImpairment(data, mode, length) {
        if (Math.random() < this.lossRate) {
            this.stats.dropped++;
            // If it's a shared packet, we must release the slot immediately on drop
            if (mode === 'rx_shared' && this.innerTransport.pool) {
                Atomics.store(this.innerTransport.pool.control, 3 + data.slotIdx, 0);
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
            } else if (mode === 'rx_shared') {
                this.emit('packet_shared', data.slotIdx, data.length);
            } else {
                this.emit('packet', data);
            }
        }, actualDelay);
    }

    close() {
        if (this.innerTransport) this.innerTransport.close();
        super.close();
    }
}

module.exports = NetworkSimulator;
