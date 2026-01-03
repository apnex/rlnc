const PacketSerializer = require('../network/packet_serializer');
const CodedPiece = require('../network/coded_piece');
const config = require('../config');

console.log("Verifying Serializer...");
const piece = new CodedPiece(1, Buffer.alloc(config.PROTOCOL.PIECE_COUNT, 1), Buffer.alloc(1024, 0xFF));
const buf = PacketSerializer.serialize(piece, config.PROTOCOL);
const out = PacketSerializer.deserialize(buf, config.PROTOCOL);

if(out && out.genId === 1 && out.data.length === 1024) console.log("[PASS] Serialization OK");
else {
    console.error("[FAIL] Serialization mismatch");
    console.log("Expected genId 1, got:", out ? out.genId : 'null');
    console.log("Expected data length 1024, got:", out ? out.data.length : 'null');
    process.exit(1);
}
