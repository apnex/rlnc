const CodedPiece = require('./coded_piece');

class PacketSerializer {
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

        let offset = 4; // Skip Magic, Ver, Reserved
        const genId = buf.readUInt32BE(offset); offset += 4;
        
        const N = config.PIECE_COUNT || 64; 
        
        const coeffs = buf.subarray(offset, offset + N);
        offset += N;
        const data = buf.subarray(offset);

        return new CodedPiece(genId, coeffs, data);
    }
}
module.exports = PacketSerializer;
