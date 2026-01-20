module.exports = {
    DATA: { INPUT_PATH: '', DUMMY_SIZE: 1024 * 1024 * 16 },
    PROTOCOL: { MAGIC_BYTE: 0xAA, VERSION: 0x01, HEADER_SIZE: 8, PIECE_COUNT: 64 },
    TRANSCODE: { PIECE_COUNT: 64, PIECE_SIZE: 1024, SYSTEMATIC: true },
    NETWORK: {
        LOSS_RATE: 0.05, // 5% loss to test redundancy
        REDUNDANCY: 2.0,
        LATENCY: 10,
        JITTER: 2,
        PEER_ADDRESS: '127.0.0.1',
        PEER_PORT: 46642,
        UNIDIRECTIONAL: true
    },
    WINDOW: { SIZE: 8, TIMEOUT: 1000 }, // Smaller window for higher density
    SYSTEM: { TARGET_THROUGHPUT_MB: 0.1, TICK_RATE: 20, THREADS: 4, GLOBAL_TIMEOUT: 120000 },
    TOTAL_GENS: 256
};
