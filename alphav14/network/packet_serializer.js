/**
 * ALPHAv13 Aether-Native Packet Serializer
 * @warden-purpose Bit-perfect wire framing driven by Aether DNA.
 * @warden-scope Data Plane / Framing
 */
class PacketSerializer {
    // Header v2.1 Schema:
    // [0..1]   Magic (0xAA01)
    // [2..3]   Flags
    // [4..7]   SessionID (UInt32BE) - Inducted from Aether
    // [8..11]  GenID (UInt32BE)
    // [12..15] SequenceID (UInt32BE)
    // Total: 16 Bytes (Aligned)

    /**
     * Sovereign Serialization
     * @param {Object} piece - CodedPiece object.
     * @param {AetherAdapter} adapter - Sovereign DNA source.
     * @param {Uint8Array} target - Pre-allocated Pool Slot.
     */
    static serialize(piece, adapter, target, sequence = 0) {
        const sessionId = adapter.get('FLOW_SESSION_ID');
        const n = adapter.get('FLOW_PIECE_COUNT');
        
        // 1. Header (16 Bytes)
        target[0] = 0xAA;
        target[1] = 0x01;
        target[2] = 0; // Flags
        target[3] = 0; // Reserved

        // Big-Endian mapping into the raw view
        const dv = new DataView(target.buffer, target.byteOffset, 16);
        dv.setUint32(4, sessionId, false);
        dv.setUint32(8, piece.genId, false);
        dv.setUint32(12, sequence, false);

        let offset = 16;

        // 2. Coeffs (N bytes) - Zero-Copy Transfer
        target.set(piece.coeffs, offset);
        offset += n;

        // 3. Data (S bytes) - Zero-Copy Transfer
        target.set(piece.data, offset);
        
        return offset + piece.data.length;
    }

    /**
     * Sovereign Deserialization
     */
    static deserialize(source, adapter) {
        if (source[0] !== 0xAA || source[1] !== 0x01) return null;

        const dv = new DataView(source.buffer, source.byteOffset, 16);
        const sessionId = dv.getUint32(4, false);
        const genId     = dv.getUint32(8, false);
        const sequence  = dv.getUint32(12, false);

        const n = adapter.get('FLOW_PIECE_COUNT');
        const s = adapter.get('FLOW_PIECE_SIZE');

        let offset = 16;
        const coeffs = source.subarray(offset, offset + n);
        offset += n;
        const data = source.subarray(offset, offset + s);

        return { sessionId, genId, sequence, coeffs, data };
    }
}

module.exports = PacketSerializer;
