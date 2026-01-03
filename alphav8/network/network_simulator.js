const Transport = require('./transport');

class NetworkSimulator extends Transport {
    constructor(options = {}) {
        super();
        this.lossRate = options.lossRate || 0.0;
        this.delay = options.delay || 10; 
        this.jitter = options.jitter || 0;
        this.stats = { sent: 0, dropped: 0, delivered: 0 };
    }

    send(packet) {
        this.stats.sent++;
        
        if (Math.random() < this.lossRate) {
            this.stats.dropped++;
            return; 
        }

        // Calculate Jitter (+/- range)
        const jitterCalc = (Math.random() * this.jitter * 2) - this.jitter;
        const actualDelay = Math.max(0, this.delay + jitterCalc);

        setTimeout(() => {
            this.stats.delivered++;
            this.emit('packet', packet);
        }, actualDelay);
    }

    close() {
        // Simulator uses Timeouts which aren't easily canceled without tracking,
        // but for now, we align with the interface.
    }
}
module.exports = NetworkSimulator;
