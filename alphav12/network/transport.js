/**
 * Abstract Transport Layer
 * @warden-purpose Orchestrates data movement between network worker threads.
 * @warden-scope Networking
 */
const EventEmitter = require('events');

/**
 * ITransport Interface Abstraction (CON-004)
 * Base class for all network communication layers.
 * Supports standard Buffer passing and high-performance SharedArrayBuffer offsets.
 */
class ITransport extends EventEmitter {
    constructor() {
        super();
        if (this.constructor === ITransport) {
            throw new Error("ITransport is an interface and cannot be instantiated directly.");
        }
    }

    /**
     * Opens the ingest gate.
     * @param {number} port 
     */
    listen(port) {
        throw new Error("Method 'listen(port)' must be implemented.");
    }

    /**
     * Identifies the peer destination.
     * @param {string} address 
     * @param {number} port 
     */
    connect(address, port) {
        throw new Error("Method 'connect(address, port)' must be implemented.");
    }

    /**
     * Sends a packet through the transport.
     * Supports legacy Buffer or SAB offset/length.
     * @param {Buffer|number} packetOrOffset 
     * @param {number} [length] 
     */
    send(packetOrOffset, length) {
        throw new Error("Method 'send()' must be implemented.");
    }

    /**
     * Fires when data lands in the ingest region.
     * @param {Function} callback 
     */
    onPacket(callback) {
        this.on('packet', callback);
    }

    /**
     * Closes the transport and releases any resources.
     */
    close() {
        this.removeAllListeners();
    }
}

module.exports = ITransport;