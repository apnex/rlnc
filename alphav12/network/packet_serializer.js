const CodedPiece = require('./coded_piece');

class PacketSerializer {
    static serializeTo(piece, config, targetView) {
        const headerSize = config.HEADER_SIZE || 8;
        let offset = 0;

        targetView[offset++] = config.MAGIC_BYTE;
        targetView[offset++] = config.VERSION;
        targetView[offset++] = 0; // Reserved
        targetView[offset++] = 0; // Reserved

        // GenID (Big Endian)
        targetView[offset++] = (piece.genId >> 24) & 0xFF;
        targetView[offset++] = (piece.genId >> 16) & 0xFF;
        targetView[offset++] = (piece.genId >> 8) & 0xFF;
        targetView[offset++] = piece.genId & 0xFF;

        // Coeffs
        for (let i = 0; i < piece.coeffs.length; i++) {
            targetView[offset++] = piece.coeffs[i];
        }

        // Data
        targetView.set(piece.data, offset);
        return offset + piece.data.length;
    }

    static serialize(piece, config) {
        // Header: Magic(1) + Ver(1) + Reserved(2) + GenID(4) = 8
        const headerSize = config.HEADER_SIZE || 8;
        const totalSize = headerSize + piece.coeffs.length + piece.data.length;
        
        const buf = Buffer.allocUnsafe(totalSize);
        let offset = 0;

        buf.writeUInt8(config.MAGIC_BYTE, offset++);
        buf.writeUInt8(config.VERSION, offset++);
        buf.writeUInt16BE(0, offset); offset += 2; // Reserved
        buf.writeUInt32BE(piece.genId, offset); offset += 4;
        
        // Coeffs
        for(let i=0; i<piece.coeffs.length; i++) {
            buf[offset++] = piece.coeffs[i];
        }

        // Data
        piece.data.copy(buf, offset);
        
        return buf;
    }

    static deserialize(buf, config) {
        const headerSize = config.HEADER_SIZE || 8;
        if (buf.length < headerSize) return null;
        if (buf[0] !== config.MAGIC_BYTE) return null;

        // Manual Big-Endian Read for Uint8Array compatibility
        const genId = (buf[4] << 24) | (buf[5] << 16) | (buf[6] << 8) | buf[7];
        let offset = 8;
        
        const N = config.PIECE_COUNT || 64; 
        const S = config.PIECE_SIZE || 1024;
        
        const coeffs = buf.subarray(offset, offset + N);
        offset += N;
        const data = buf.subarray(offset, offset + S);

        return new CodedPiece(genId, coeffs, data);
    }
}
module.exports = PacketSerializer;