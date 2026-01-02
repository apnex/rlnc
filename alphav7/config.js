module.exports = {
    DATA: {
        INPUT_PATH: './logo.png',
        DUMMY_SIZE: 1024 * 1024 * 10
    },
    PROTOCOL: {
        MAGIC_BYTE: 0xCC,
        VERSION: 0x02,
        HEADER_SIZE: 6,
        PIECE_COUNT: 64 // Added for Serializer logic
    },
    TRANSCODE: {
        PIECE_COUNT: 64,
        PIECE_SIZE: 8192,
        SYSTEMATIC: true
    },
    NETWORK: {
        LOSS_RATE: 0.3,
        REDUNDANCY: 1.1,
        LATENCY: 0,
        JITTER: 0
    },
    WINDOW: {
        SIZE: 1,
        TIMEOUT: 100
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 0.01,
        TICK_RATE: 500
    }
};
