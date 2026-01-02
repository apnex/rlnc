/**
 * REGRESSION TEST: Full Buffer Deadlock Verification
 * Ensures the BlockDecoder correctly handles rank updates when the buffer is full
 * but contains linearly dependent (redundant) rows.
 */
const BlockEncoder = require('./block_encoder');
const BlockDecoder = require('./block_decoder');
const crypto = require('crypto');

const CONFIG = {
    PIECE_COUNT: 4,      // Small count for easy debugging
    PIECE_SIZE: 16,      // Small size
    SYSTEMATIC: true
};

function runTest() {
    console.log(`\n=========================================`);
    console.log(`🛡️  REGRESSION TEST: DECODER DEADLOCK`);
    console.log(`=========================================`);

    // 1. Setup
    const data = crypto.randomBytes(CONFIG.PIECE_COUNT * CONFIG.PIECE_SIZE);
    const encoder = new BlockEncoder(data, 100, CONFIG);
    const decoder = new BlockDecoder(CONFIG);

    // 2. Generate systematic packets (Linearly Independent)
    const packets = [];
    for(let i=0; i<CONFIG.PIECE_COUNT; i++) {
        packets.push(encoder.codedPiece());
    }

    // 3. Feed N-1 packets (Rank = 3)
    console.log(`[Step 1] Feeding ${CONFIG.PIECE_COUNT - 1} valid packets...`);
    for(let i=0; i<CONFIG.PIECE_COUNT - 1; i++) {
        decoder.addPiece(packets[i]);
    }
    console.log(`   -> Decoder Filled Rows: ${decoder.filledRows}/${CONFIG.PIECE_COUNT}`);

    // 4. Feed a DUPLICATE of packet #0 (Rank stays 3, FilledRows becomes 4 if bug exists)
    console.log(`[Step 2] Feeding 1 DUPLICATE packet (simulating redundancy)...`);
    decoder.addPiece(packets[0]); 
    console.log(`   -> Decoder Filled Rows: ${decoder.filledRows}/${CONFIG.PIECE_COUNT}`);
    
    if (decoder.solved) {
        console.log("   -> UNEXPECTED: Solved with insufficient rank?");
    } else {
        console.log("   -> Status: Not Solved (Expected)");
    }

    // 5. Feed the FINAL valid packet (Should solve it if reset logic works)
    console.log(`[Step 3] Feeding the FINAL valid packet...`);
    decoder.addPiece(packets[CONFIG.PIECE_COUNT - 1]);

    // 6. Report
    console.log(`=========================================`);
    if (decoder.solved) {
        console.log(`✅ TEST PASSED: Decoder correctly reset buffer and solved the matrix.`);
    } else {
        console.log(`❌ TEST FAILED: Decoder rejected the final packet (Deadlock Detected).`);
        console.log(`   Reason: It likely thought the buffer was full (filledRows=${decoder.filledRows})`);
        console.log(`   Actual Rank needed: ${CONFIG.PIECE_COUNT}, but stuck at Rank 3.`);
    }
    console.log(`=========================================\n`);
}

runTest();
