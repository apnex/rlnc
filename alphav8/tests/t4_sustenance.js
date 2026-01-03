module.exports = {
    DATA: { 
        INPUT_PATH: '', 
        DUMMY_SIZE: 1024 * 1024 * 16 // 16MB
    },
    PROTOCOL: { 
        MAGIC_BYTE: 0xAA, 
        VERSION: 0x01, 
        HEADER_SIZE: 8, 
        PIECE_COUNT: 64 
    },
    TRANSCODE: { 
        PIECE_COUNT: 64, 
        PIECE_SIZE: 1024, 
        SYSTEMATIC: true 
    },
    NETWORK: { 
        LOSS_RATE: 0.30,     // 30% High Loss
        REDUNDANCY: 2.0,     // Increased overhead to 2.0x to compensate
        LATENCY: 10,         
        JITTER: 5           
    },
    WINDOW: { 
        SIZE: 6,             // Narrower window to focus CPU on fewer generations
        TIMEOUT: 1500        // Increased timeout for high-loss survival
    },
    SYSTEM: { 
        TARGET_THROUGHPUT_MB: 30, // Lowered target to accommodate heavy repair math
        TICK_RATE: 20 
    }
};
