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
        SYSTEMATIC: false    // CRITICAL: Every packet is now a linear combination
    },
    NETWORK: { 
        LOSS_RATE: 0.05,     // Light loss to keep focus on decoding math
        REDUNDANCY: 1.5,     
        LATENCY: 2,         
        JITTER: 1           
    },
    WINDOW: { 
        SIZE: 4,             // Reduced window further; Decoder will be slow
        TIMEOUT: 2000        
    },
    SYSTEM: { TARGET_THROUGHPUT_MB: 40, TICK_RATE: 20, GLOBAL_TIMEOUT: 60000 }
}
