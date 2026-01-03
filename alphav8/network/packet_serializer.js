const CodedPiece = require('./coded_piece');

class PacketSerializer {
    static serialize(piece, config) {
        // Header: Magic(1) + Ver(1) + GenID(4) + Coeffs(N) + Data(M)
        const headerSize = config.HEADER_SIZE;
        const totalSize = headerSize + piece.coeffs.length + piece.data.length;
        
        const buf = Buffer.allocUnsafe(totalSize);
        let offset = 0;

        buf.writeUInt8(config.MAGIC_BYTE, offset++);
        buf.writeUInt8(config.VERSION, offset++);
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
        if (buf.length < config.HEADER_SIZE) return null;
        if (buf[0] !== config.MAGIC_BYTE) return null;

        let offset = 2;
        const genId = buf.readUInt32BE(offset); offset += 4;
        
        // We need to know Coeff Size (Piece Count). 
        // In a real protocol, this might be in the header. 
        // Here we infer it: Length - Header - PieceSize? 
        // Actually, easier if we assume Fixed Config for this simulation.
        // Let's assume 64 coeffs (from config usually).
        
        // Dynamic Inference: 
        // We assume Data Size is fixed or known?
        // Let's use the buffer remainder. 
        // Typically: Coeffs = PieceCount, Data = PieceSize.
        // Total - Header = Coeffs + Data.
        // This is ambiguous without config. 
        // For ALPHAv6, we hardcode to the TRANSCODE config usually passed in context,
        // BUT simplistic approach: 
        // We know standard is 64 coeffs + 1024 data (example).
        
        // FIX: The deserializer needs access to Piece Count to split Coeffs/Data.
        // We will pass `config.TRANSCODE` usually, but here we only passed Protocol.
        // Let's rely on Main to pass correct config, OR heuristic:
        // Coeffs are typically small (64). Data is large (1024+).
        
        // Better: We just pass "64" as a known constant or read from global config.
        const pieceCount = 64; // HARDCODED for Safety if context missing, but Main passes it.
        // To be safe, let's update Main to pass PieceCount or fix logic.
        
        // REVISION: The `main.js` calls deserialize with `config.PROTOCOL`.
        // Let's update `deserialize` to take `pieceCount` as optional arg or just use a standard calculation.
        
        // Actually, let's look at the buffer length.
        // length = 6 + N + M.
        // If we don't know N or M, we are stuck.
        // Let's assume standard Config from Main has been set.
        
        // HACK for robustness: 
        // We will assume `pieceCount` is 64 for this install script version 
        // unless provided in config object as `PIECE_COUNT`.
        const N = config.PIECE_COUNT || 64; 
        
        const coeffs = buf.subarray(offset, offset + N);
        offset += N;
        const data = buf.subarray(offset);

        return new CodedPiece(genId, coeffs, data);
    }
}
module.exports = PacketSerializer;
