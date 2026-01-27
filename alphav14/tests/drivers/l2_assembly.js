const BaseDriver = require("../framework/BaseDriver");
const BlockEncoder = require("../../core/block_encoder");
const BlockDecoder = require("../../core/block_decoder");
const crypto = require("crypto");

/**
 * L1-ASSEMBLY-VERIFY (Aether Egress Test)
 * @warden-purpose Verify the BlockDecoder Assembly Layer (getData)
 * @pillar Pillar 4: Symmetric Perception
 */
class AssemblyDriver extends BaseDriver {
    constructor(config, adapter) {
        super(config, adapter);
        this.status = "INIT";
        
        // Extract Math Kernel configuration if present
        this.mathKernel = config.math?.kernel; // e.g., "QUADRANT"
    }

    async start() {
        this.status = "RUNNING";
        this.adapter.markStart();
        
        const kernelName = this.mathKernel || "DEFAULT (Galois)";
        console.log(`[L1-ASM] Starting Assembly Layer Verification [Kernel: ${kernelName}]...`);

        try {
            // 1. Generate Random Payload
            const pieceCount = this.adapter.get('FLOW_PIECE_COUNT');
            const pieceSize = this.adapter.get('FLOW_PIECE_SIZE');
            const totalSize = pieceCount * pieceSize;
            
            const payload = new Uint8Array(totalSize);
            crypto.randomFillSync(payload);
            console.log(`[L1-ASM] Payload Generated: ${totalSize} bytes`);

            // 2. Ingress (Lease & Load)
            let t0 = performance.now();
            const sourceHandles = new Int32Array(pieceCount);
            
            for (let i = 0; i < pieceCount; i++) {
                const handle = this.adapter.reservePiece();
                const offset = this.adapter.resolvePieceOffset(handle);
                
                // Manual Slicing
                const start = i * pieceSize;
                const end = start + pieceSize;
                const chunk = payload.subarray(start, end);
                
                // Copy chunk to SDB
                const sdbView = new Uint8Array(this.adapter.pcb.sab, offset, pieceSize);
                sdbView.set(chunk); 
                
                sourceHandles[i] = handle;
            }
            let t1 = performance.now();
            let ingressMB = (totalSize / 1024 / 1024) / ((t1 - t0) / 1000);
            console.log(`[L1-ASM] Ingress Complete. ${pieceCount} pieces loaded into SDB. [${(t1-t0).toFixed(2)}ms | ${ingressMB.toFixed(2)} MB/s]`);

            // 3. Encode (Stateless Orchestration)
            const isSystematic = this.adapter.get('FLOW_SYSTEMATIC') === 1;
            const encoderConfig = { 
                PIECE_COUNT: pieceCount, 
                PIECE_SIZE: pieceSize,
                MATH_KERNEL: this.mathKernel,
                SYSTEMATIC: isSystematic
            };
            const encoder = new BlockEncoder(this.adapter, encoderConfig);
            encoder.bind(sourceHandles);
            
            t0 = performance.now();
            const packets = [];
            
            // Production Logic:
            // IF Systematic: Produce N systematic + Overhead Coded?
            // IF Coded: Produce N * Overhead Coded only.
            // For valid verification, we need to produce enough packets to solve (Rank = N).
            
            const overhead = 1.1; // 10% overhead
            
            if (isSystematic) {
                // Systematic Phase
                for (let i = 0; i < pieceCount; i++) packets.push(encoder.produceSystematic());
                
                // If QUADRANT, produce extra coded packets to exercise the kernel
                if (this.mathKernel === "QUADRANT") {
                   for (let i = 0; i < 16; i++) packets.push(encoder.produceCoded());
                }
            } else {
                // Pure Coded Phase
                const packetTarget = Math.ceil(pieceCount * overhead);
                for (let i = 0; i < packetTarget; i++) packets.push(encoder.produceCoded());
            }
            
            t1 = performance.now();
            
            // Calc Encode Throughput
            // If Systematic, most packets are 0-cost identity. Throughput will be huge.
            // If Coded, all packets are XOR math. Throughput will be lower.
            const totalEncodedBytes = packets.length * pieceSize;
            let encodeMB = (totalEncodedBytes / 1024 / 1024) / ((t1 - t0) / 1000);
            
            console.log(`[L1-ASM] Encoding Complete. ${packets.length} packets produced (Sys:${isSystematic}). [${(t1-t0).toFixed(2)}ms | ${encodeMB.toFixed(2)} MB/s]`);

            // 4. Decode (Stateless Orchestration)
            const decoder = new BlockDecoder(this.adapter, encoderConfig);
            
            let solved = false;
            // Shuffle to ensure robust solving order
            const packetList = packets.sort(() => Math.random() - 0.5);

            t0 = performance.now();
            for (const pkt of packetList) {
                solved = decoder.addPiece(pkt.handle, pkt.manifest);
                if (solved) break;
            }
            t1 = performance.now();
            
            if (!solved) {
                throw new Error("Decoder failed to solve!");
            }
            
            // Decode Throughput (Processing the incoming stream)
            // It processed 'totalSize' worth of information to solve.
            let decodeMB = (totalSize / 1024 / 1024) / ((t1 - t0) / 1000);
            console.log(`[L1-ASM] Decoder Solved. [${(t1-t0).toFixed(2)}ms | ${decodeMB.toFixed(2)} MB/s]`);

            // 5. Egress (The Test Subject)
            t0 = performance.now();
            const reconstructed = decoder.getData();
            t1 = performance.now();
            
            if (!reconstructed) {
                throw new Error("getData() returned null despite being solved!");
            }
            
            let egressMB = (reconstructed.length / 1024 / 1024) / ((t1 - t0) / 1000);
            console.log(`[L1-ASM] Egress Complete. Retrieved ${reconstructed.length} bytes. [${(t1-t0).toFixed(2)}ms | ${egressMB.toFixed(2)} MB/s]`);

            // 6. Verify Parity
            let errors = 0;
            for (let i = 0; i < totalSize; i++) {
                if (payload[i] !== reconstructed[i]) {
                    errors++;
                    if (errors < 5) console.error(`Mismatch at byte ${i}: Expected ${payload[i]}, Got ${reconstructed[i]}`);
                }
            }

            if (errors > 0) {
                throw new Error(`Parity Failure: ${errors} byte mismatches.`);
            }

            console.log(`[L1-ASM] SUCCESS: Bit-Perfect Reconstruction [Kernel: ${kernelName}].`);
            this.adapter.set('PULSE_VERIFY', 2); // MATCH

            // Cleanup handles
            for(let i=0; i<pieceCount; i++) this.adapter.releasePiece(sourceHandles[i]);
            decoder.reset(); 

        } catch (err) {
            console.error(`[L1-ASM-FAULT] ${err.stack}`);
            this.adapter.set('PULSE_VERIFY', 3); // FAIL
        }

        this.adapter.commit();
        this.adapter.markEnd();
        this.status = "DONE";
    }
}

module.exports = AssemblyDriver;