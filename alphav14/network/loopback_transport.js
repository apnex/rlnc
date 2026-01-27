const ITransport = require('./transport');

/**
 * Synchronous Loopback Transport for architecture debugging.
 * Supports Zero-Copy shared buffer pass-through.
 */
class LoopbackTransport extends ITransport {
    constructor() {
        super();
    }

    listen(port) { return Promise.resolve(); }
    connect(address, port) { }

    send(packetOrOffset, length) {
        if (typeof packetOrOffset === 'number') {
            // High-performance Zero-Copy Relay
            setImmediate(() => {
                this.emit('packet_shared', packetOrOffset, length);
            });
        } else {
            // Legacy Buffer Relay
            setImmediate(() => {
                this.emit('packet', packetOrOffset);
            });
        }
    }

    close() { super.close(); }
}

module.exports = LoopbackTransport;
