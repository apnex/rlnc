const EventEmitter = require('events');

/**
 * ALPHAv8 Transport Abstraction
 * Base class for all network communication layers (Simulated, UDP, TCP, etc.)
 */
class Transport extends EventEmitter {
    constructor() {
        super();
        if (this.constructor === Transport) {
            throw new Error("Transport is an abstract class and cannot be instantiated directly.");
        }
    }

    /**
     * Sends a packet through the transport.
     * @param {Buffer} packet - The serialized packet to transmit.
     */
    send(packet) {
        throw new Error("Method 'send(packet)' must be implemented.");
    }

    /**
     * Closes the transport and releases any resources.
     */
    close() {
        // Optional override
    }
}

module.exports = Transport;
