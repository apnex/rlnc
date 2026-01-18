module.exports = {
    DATA: {
        INPUT_PATH: './logo.png',
        DUMMY_SIZE: 1024 * 1024 * 16 // 8MB Stress Test
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xAA,
        VERSION: 0x01,
        HEADER_SIZE: 8,
        PIECE_COUNT: 64
    },
    TRANSCODE: {
        PIECE_COUNT: 64,
        PIECE_SIZE: 1024 * 8,   // 8KB symbols (High-bandwidth mode)
        SYSTEMATIC: false
    },
    NETWORK: {
        LOSS_RATE: 0.00,    // 5% Light Loss (Real-world simulation)
        REDUNDANCY: 1.1,    // 30% Overhead allowance
        LATENCY: 1,
        JITTER: 0
    },
    WINDOW: {
        SIZE: 8,           // Pressure: 12 concurrent generations
        TIMEOUT: 1000
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 100, // Targeting 100MB/s simulated net
        TICK_RATE: 10,
        THREADS: 4,          // 0 = Dynamic (Hardware Aware), >0 = Fixed
        GLOBAL_TIMEOUT: 60000
    }
};
