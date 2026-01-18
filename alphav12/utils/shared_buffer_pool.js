/**
 * HIGH-PERFORMANCE SHARED BUFFER POOL (CON-004)
 * Bifurcated for TX and RX to prevent memory collisions.
 */

class SharedBufferPool {
    constructor(numSlots = 4096, slotSize = 9000) {
        this.numSlots = numSlots;
        this.halfSlots = Math.floor(numSlots / 2);
        this.slotSize = slotSize;

        // 1. Control Region (Atomics)
        // 0: Lock
        // 1: TX Tail
        // 2: RX Tail
        // 3... : Slot Statuses
        this.controlBuffer = new SharedArrayBuffer(32768); 
        this.control = new Int32Array(this.controlBuffer);

        // 2. Data Region
        this.dataBuffer = new SharedArrayBuffer(numSlots * slotSize);
        this.data = new Uint8Array(this.dataBuffer);
    }

    getSlotView(index) {
        const offset = index * this.slotSize;
        return this.data.subarray(offset, offset + this.slotSize);
    }

    lockSlot(index) {
        Atomics.add(this.control, 3 + index, 1);
    }

    unlockSlot(index) {
        const current = Atomics.sub(this.control, 3 + index, 1);
        if (current <= 1) {
            Atomics.store(this.control, 3 + index, 0); // Fully released
        }
    }

    isSlotBusy(index) {
        return Atomics.load(this.control, 3 + index) > 0;
    }

    acquireTX() {
        const maxAttempts = this.halfSlots;
        for (let i = 0; i < maxAttempts; i++) {
            let tail = Atomics.load(this.control, 1);
            let nextTail = (tail + 1) % this.halfSlots;
            
            // Try to claim the tail pointer
            if (Atomics.compareExchange(this.control, 1, tail, nextTail) === tail) {
                // Try to lock the slot (0 -> 1)
                if (Atomics.compareExchange(this.control, 3 + tail, 0, 1) === 0) {
                    return tail;
                }
            }
        }
        return -1; // Pool Full
    }

    acquireRX() {
        const maxAttempts = this.halfSlots;
        for (let i = 0; i < maxAttempts; i++) {
            let tail = Atomics.load(this.control, 2);
            let nextTail = (tail + 1) % this.halfSlots;
            let slotIdx = this.halfSlots + tail;

            if (Atomics.compareExchange(this.control, 2, tail, nextTail) === tail) {
                if (Atomics.compareExchange(this.control, 3 + slotIdx, 0, 1) === 0) {
                    return slotIdx;
                }
            }
        }
        return -1; // SIGNAL: DROP
    }
}

module.exports = SharedBufferPool;