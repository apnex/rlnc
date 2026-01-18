const ITransport = require('./transport');

/**
 * Synchronous Loopback Transport for architecture debugging.
 */
class LoopbackTransport extends ITransport {
    constructor() {
        super();
    }

    listen(port) { return Promise.resolve(); }
    connect(address, port) { }

    send(packet) {
        // Instant relay
        this.emit('packet', packet);
    }

    close() { super.close(); }
}

module.exports = LoopbackTransport;
