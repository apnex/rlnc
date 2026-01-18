// Simple buffer reuse to reduce GC pressure
const POOL_SIZE = 100;
const BUFFER_SIZE = 65536; // Default max
const pool = [];

module.exports = {
    get: (size) => {
        if (size > BUFFER_SIZE) return Buffer.allocUnsafe(size);
        if (pool.length > 0) return pool.pop();
        return Buffer.allocUnsafe(BUFFER_SIZE);
    },
    release: (buf) => {
        if (buf.length === BUFFER_SIZE && pool.length < POOL_SIZE) {
            pool.push(buf);
        }
    }
};
