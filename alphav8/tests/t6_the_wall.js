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
        PIECE_SIZE: 8192,   // 8KB Symbols
        SYSTEMATIC: false    // Full Coded math
    },
    NETWORK: { 
        LOSS_RATE: 0.02,     // Minimal loss
        REDUNDANCY: 1.3,     
        LATENCY: 2,         
        JITTER: 1           
    },
    WINDOW: { 
        SIZE: 2,             // Extremely narrow window to prevent total lockup
        TIMEOUT: 5000        
    },
    SYSTEM: { 
        TARGET_THROUGHPUT_MB: 5, // Very slow target to give CPU a chance
        TICK_RATE: 20 
    }
}
