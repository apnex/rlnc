module.exports = {
    DATA: {
        INPUT_PATH: './logo.png',
        DUMMY_SIZE: 1024 * 1024 * 8 // 8MB Stress Test
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xAA,
        VERSION: 0x01,
        HEADER_SIZE: 8,
        PIECE_COUNT: 64
    },
    TRANSCODE: {
        PIECE_COUNT: 64,
        PIECE_SIZE: 8192,   // 8KB symbols (High-bandwidth mode)
        SYSTEMATIC: true
    },
    NETWORK: {
        LOSS_RATE: 0.01,    // 5% Light Loss (Real-world simulation)
        REDUNDANCY: 1.1,    // 30% Overhead allowance
        LATENCY: 2,
        JITTER: 1
    },
    WINDOW: {
        SIZE: 12,           // Pressure: 12 concurrent generations
        TIMEOUT: 1000
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 100, // Targeting 100MB/s simulated net
        TICK_RATE: 20
    }
};
