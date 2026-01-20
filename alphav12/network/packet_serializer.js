/**
 * Binary Data Serializer (v2 - Ratified in CON-013)
 * @warden-purpose 16-byte structured header for session and loss tracking.
 * @warden-scope Transport Layer
 */
const CodedPiece = require('./coded_piece');

class PacketSerializer {
    // Header v2 Schema:
    // [0..1]   Magic (0xAA01)
    // [2..3]   Flags
    // [4..7]   SessionID
    // [8..11]  GenID
    // [12..15] SequenceID
    // Total: 16 Bytes

    static serializeTo(piece, config, targetView, sequence = 0, sessionId = 0) {
        let offset = 0;

        // Magic & Version (Flags)
        targetView[offset++] = 0xAA;
        targetView[offset++] = 0x01;
        targetView[offset++] = config.FLAGS || 0;
        targetView[offset++] = 0; // Reserved

        // SessionID
        targetView[offset++] = (sessionId >> 24) & 0xFF;
        targetView[offset++] = (sessionId >> 16) & 0xFF;
        targetView[offset++] = (sessionId >> 8) & 0xFF;
        targetView[offset++] = sessionId & 0xFF;

        // GenID
        targetView[offset++] = (piece.genId >> 24) & 0xFF;
        targetView[offset++] = (piece.genId >> 16) & 0xFF;
        targetView[offset++] = (piece.genId >> 8) & 0xFF;
        targetView[offset++] = piece.genId & 0xFF;

        // SequenceID
        targetView[offset++] = (sequence >> 24) & 0xFF;
        targetView[offset++] = (sequence >> 16) & 0xFF;
        targetView[offset++] = (sequence >> 8) & 0xFF;
        targetView[offset++] = sequence & 0xFF;

        // Coeffs
        for (let i = 0; i < piece.coeffs.length; i++) {
            targetView[offset++] = piece.coeffs[i];
        }

        // Data
        targetView.set(piece.data, offset);
        return offset + piece.data.length;
    }

    static deserialize(buf, config) {
        if (buf.length < 16) return null;
        if (buf[0] !== 0xAA || buf[1] !== 0x01) return null;

        const sessionId = (buf[4] << 24) | (buf[5] << 16) | (buf[6] << 8) | buf[7];
        const genId = (buf[8] << 24) | (buf[9] << 16) | (buf[10] << 8) | buf[11];
        const sequence = (buf[12] << 24) | (buf[13] << 16) | (buf[14] << 8) | buf[15];
        
        let offset = 16;
        const N = config.PIECE_COUNT || 64; 
        const S = config.PIECE_SIZE || 1024;
        
        const coeffs = buf.subarray(offset, offset + N);
        offset += N;
        const data = buf.subarray(offset, offset + S);

        const piece = new CodedPiece(genId, coeffs, data);
        piece.sessionId = sessionId;
        piece.sequence = sequence;
        return piece;
    }
}
module.exports = PacketSerializer;
