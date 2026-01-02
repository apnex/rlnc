const { parentPort } = require('worker_threads');
const BlockEncoder = require('../core/block_encoder');
const PacketSerializer = require('../network/packet_serializer');

// Map<GenID, BlockEncoder>
const encoders = new Map();

parentPort.on('message', (msg) => {
    switch (msg.type) {
        case 'INIT':
            try {
                // Baseline behavior: Creates a copy/view of the buffer (Standard Node.js)
                const safeBuffer = Buffer.from(msg.data);
                const enc = new BlockEncoder(safeBuffer, msg.genId, msg.config);
                encoders.set(msg.genId, enc);
            } catch (e) {
                // Silently ignore errors to prevent worker crash loop
            }
            break;

        case 'PRODUCE':
            producePackets(msg.limit, msg.protocolConfig);
            break;

        case 'BOOST':
            // FIX: BlockEncoder (Core) is stateless and has no .boost() method.
            // We manually generate the requested number of packets here.
            const target = encoders.get(msg.genId);
            if (target) {
                for (let i = 0; i < msg.count; i++) {
                    // Note: Legacy BOOST messages might not carry protocolConfig.
                    // We default to {} to let PacketSerializer use its internal defaults.
                    const fallbackConfig = { HEADER_SIZE: 8, MAGIC_BYTE: 0xAA, VERSION: 1 };
                    sendPacket(target, msg.protocolConfig || fallbackConfig);
                }
            }
            break;

        case 'ACK':
            encoders.delete(msg.genId);
            break;
    }
});

/**
 * Shared logic to generate, serialize, and transmit a packet.
 * Returns true if a packet was successfully sent.
 */
function sendPacket(encoder, protocol) {
    const piece = encoder.codedPiece();
    
    if (piece) {
        const buf = PacketSerializer.serialize(piece, protocol);
        
        // Baseline behavior: Standard structured clone (Copy).
        // Zero-Copy optimizations are strictly reserved for the V7 upgrade phase.
        parentPort.postMessage({
            type: 'PACKET',
            genId: piece.genId,
            payload: buf
        });
        return true;
    }
    return false;
}

function producePackets(limit, protocol) {
    let produced = 0;
    const activeIds = Array.from(encoders.keys());
    
    if (activeIds.length === 0) return;

    while (produced < limit) {
        // Simple random scheduler
        const randomId = activeIds[Math.floor(Math.random() * activeIds.length)];
        const encoder = encoders.get(randomId);

        if (!encoder) break; 

        if (sendPacket(encoder, protocol)) {
            produced++;
        } else {
            // If an encoder fails to produce (e.g. error), stop trying this cycle
            break;
        }
    }
}
