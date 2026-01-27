/**
 * Off-Main-Thread Networking
 * @warden-purpose Non-blocking UDP processing via worker threads.
 * @warden-scope Networking
 */
const { parentPort, workerData } = require('worker_threads');
const dgram = require('dgram');

/**
 * HIGH-PERFORMANCE UDP INGEST WORKER (CON-004)
 * Writes directly to SharedArrayBuffer to bypass Main Thread.
 */

const { controlBuffer, dataBuffer, numSlots, slotSize } = workerData;
const control = new Int32Array(controlBuffer);
const data = new Uint8Array(dataBuffer);
const halfSlots = Math.floor(numSlots / 2);

const socket = dgram.createSocket('udp4');

socket.on('message', (msg, rinfo) => {
    // 1. Atomic Acquisition of RX Slot
    const slotIdx = acquireRX();
    
    if (slotIdx === -1) {
        // Pool Full: UDP Drop Policy
        return;
    }

    // 2. Zero-Copy Write
    const offset = slotIdx * slotSize;
    data.set(msg, offset);

    // 3. Notify Main Thread
    parentPort.postMessage({
        type: 'PACKET',
        slotIdx,
        length: msg.length,
        port: rinfo.port,
        address: rinfo.address
    });
});

socket.on('error', (err) => {
    parentPort.postMessage({ type: 'ERROR', error: err.message });
});

parentPort.on('message', (msg) => {
    if (msg.type === 'BIND') {
        socket.bind(msg.port, () => {
            parentPort.postMessage({ type: 'BOUND', address: socket.address() });
        });
    } else if (msg.type === 'SEND') {
        if (typeof msg.packet === 'number') {
            // ZERO-COPY SEND
            const offset = msg.packet * slotSize;
            const view = data.subarray(offset, offset + msg.length);
            // DEBUG: Trace Packet Send
            // process.stdout.write(`[UDP_WORKER] Sending ${msg.length} bytes to ${msg.address}:${msg.port}\n`);
            socket.send(view, msg.port, msg.address, (err) => {
                if (err) parentPort.postMessage({ type: 'ERROR', error: err.message });
                // Release the slot back to the pool after kernel dispatch
                Atomics.store(control, 3 + msg.packet, 0);
            });
        } else {
            // Legacy Buffer Send
            socket.send(msg.packet, msg.port, msg.address);
        }
    }
});

function acquireRX() {
    const maxAttempts = halfSlots;
    for (let i = 0; i < maxAttempts; i++) {
        let tail = Atomics.load(control, 2);
        let nextTail = (tail + 1) % halfSlots;
        let slotIdx = halfSlots + tail;

        if (Atomics.compareExchange(control, 2, tail, nextTail) === tail) {
            if (Atomics.compareExchange(control, 3 + slotIdx, 0, 1) === 0) {
                return slotIdx;
            }
        }
    }
    return -1;
}
