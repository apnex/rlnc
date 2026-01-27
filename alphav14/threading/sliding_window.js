/**
 * DECOUPLED SLIDING WINDOW CONTROLLER - AETHER NATIVE (INDUCTIVE)
 * @warden-purpose Manage session state via backplane registers.
 */
class SlidingWindow {
    constructor(adapter) {
        this.adapter = adapter;
    }

    /**
     * Slide the window forward based on head/base logic in the backplane.
     */
    _slide() {
        const base = this.adapter.get('FLOW_WINDOW_BASE');
        const size = this.adapter.get('FLOW_WINDOW_SIZE');
        const total = this.adapter.get('FLOW_RANK_TARGET');
        
        let head = this.adapter.get('FLOW_WINDOW_HEAD');
        const limit = base + size;

        while (head < limit && head < total) {
            head++;
        }
        this.adapter.set('FLOW_WINDOW_HEAD', head);
    }

    acknowledge(genId) {
        const base = this.adapter.get('FLOW_WINDOW_BASE');
        if (genId === base) {
            this.adapter.set('FLOW_WINDOW_BASE', base + 1);
            this._slide();
            return true;
        }
        return false;
    }

    get state() {
        return {
            base: this.adapter.get('FLOW_WINDOW_BASE'),
            head: this.adapter.get('FLOW_WINDOW_HEAD'),
            total: this.adapter.get('FLOW_RANK_TARGET')
        };
    }
}

module.exports = SlidingWindow;
