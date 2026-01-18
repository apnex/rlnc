module.exports = {
    DATA: {
        INPUT_PATH: './logo.png',
        DUMMY_SIZE: 1024 * 1024 * 8 // 1MB Stress Test
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xAA,
        VERSION: 0x01,
        HEADER_SIZE: 8,
        PIECE_COUNT: 64
    },
    TRANSCODE: {
        PIECE_COUNT: 64,
        PIECE_SIZE: 1024,   // 1KB symbols (High-bandwidth mode)
        SYSTEMATIC: true
    },
    NETWORK: {
        LOSS_RATE: 0.1,    // 5% Light Loss (Real-world simulation)
        REDUNDANCY: 1.2,    // 30% Overhead allowance
        LATENCY: 1,
        JITTER: 0
    },
    WINDOW: {
        SIZE: 8,           // Pressure: 12 concurrent generations
        TIMEOUT: 1000
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 1000, // Targeting 100MB/s simulated net
        TICK_RATE: 10,
        THREADS: 4,          // 0 = Dynamic (Hardware Aware), >0 = Fixed
        GLOBAL_TIMEOUT: 60000
    }
};
