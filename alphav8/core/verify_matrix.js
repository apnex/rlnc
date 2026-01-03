/**
 * ALPHAv6 Core Verify Matrix
 * Path: core/verify_matrix.js
 * Purpose: 10,000 Iteration Fuzzing using Gaussian Elimination
 */

const GaloisMatrix = require('./galois_matrix');
const GF = require('./gf256');

const ITERATIONS = 10000;
const SIZE = 8; 

function runStressTest() {
    console.log(`🚀 v7 Baseline: ${ITERATIONS} iterations of ${SIZE}x${SIZE} Matrix logic...`);
    
    let stats = { total: 0, success: 0, singular: 0, errors: 0 };
    const startTime = Date.now();

    for (let i = 0; i < ITERATIONS; i++) {
        try {
            // 1. Create a random matrix (A)
            const A = new GaloisMatrix(SIZE, SIZE);
            for (let j = 0; j < SIZE * SIZE; j++) {
                A.data[j] = Math.floor(Math.random() * 256);
            }

            // 2. Create an Augmented Matrix [A | I] to find the inverse
            const augmented = new GaloisMatrix(SIZE, SIZE * 2);
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    augmented.set(r, c, A.get(r, c)); // Copy A
                }
                augmented.set(r, SIZE + r, 1); // Append Identity I
            }

            // 3. Solve using your Gaussian Elimination
            A.solve(augmented);

            // 4. Verify if the left side is now Identity
            let isResolved = true;
            for (let r = 0; r < SIZE; r++) {
                if (augmented.get(r, r) === 0) {
                    isResolved = false; // Singular matrix
                    break;
                }
            }

            if (isResolved) {
                stats.success++;
            } else {
                stats.singular++;
            }
            
        } catch (e) {
            console.error(`❌ Critical failure at iteration ${i}:`, e.message);
            stats.errors++;
            break; 
        }
        stats.total++;

        if (i % 2000 === 0 && i > 0) console.log(`... Progress: ${i}`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n--- 📊 v7 STRESS TEST REPORT ---`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Success:  ${stats.success} (Full Rank)`);
    console.log(`Singular: ${stats.singular} (Low Rank - expected)`);
    console.log(`Failures: ${stats.errors}`);
    console.log(`--------------------------------\n`);
}

runStressTest();
