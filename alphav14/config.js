module.exports = {
    DATA: {
        INPUT_PATH: './logo.png',
        DUMMY_SIZE: 1024 * 1024 * 2 // 4MB
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xAA,
        VERSION: 0x01,
        HEADER_SIZE: 16,
        PIECE_COUNT: 512
    },
    TRANSCODE: {
        PIECE_COUNT: 512,
        PIECE_SIZE: 944,   // 1KB symbols (High-bandwidth mode)
        SYSTEMATIC: false
    },
    NETWORK: {
        LOSS_RATE: 0.00,    // 5% Light Loss (Real-world simulation)
        REDUNDANCY: 1.5,    // 30% Overhead allowance
        LATENCY: 1,
        JITTER: 0,
        UNIDIRECTIONAL: true
    },
    WINDOW: {
        SIZE: 16,           // Pressure: 12 concurrent generations
        TIMEOUT: 5000
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 0.5, // 10MB/s for a smooth visual dashboard
        TICK_RATE: 10,
        THREADS: 4,
        GLOBAL_TIMEOUT: 60000
    }
};
