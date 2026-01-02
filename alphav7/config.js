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
        LOSS_RATE: 0.0,
        REDUNDANCY: 1.0,
        LATENCY: 20,
        JITTER: 20
    },
    WINDOW: {
        SIZE: 8,
        TIMEOUT: 1000
    },
    SYSTEM: {
        TARGET_THROUGHPUT_MB: 1,
        TICK_RATE: 50
    }
};
