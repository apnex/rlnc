const { TuiWidget } = require('../framework/widget');

/**
 * Block Logic Ribbon: Visualizes the 4 phases of L1 Laboratory.
 * @pillar Pillar 3: Symmetric Perception
 */
class BlockLogicRibbon extends TuiWidget {
    constructor(options = {}) {
        super({ id: 'block-logic-ribbon', ...options });
        this.phases = [
            { id: 1, name: 'SYS-PASS', status: 'PENDING' },
            { id: 2, name: 'CODED-STRESS', status: 'PENDING' },
            { id: 3, name: 'LINEAR-DEP', status: 'PENDING' },
            { id: 4, name: 'BIT-FIDELITY', status: 'PENDING' }
        ];
    }

    update(fabricState) {
        const slot = fabricState.slots[0]; 
        if (!slot || slot.status === 'DORMANT') return;

        const currentPhase = slot.phaseId || 0;
        const verifyState = slot.verifyState;
        const isDone = slot.status === 'IDLE';

        this.phases.forEach(p => {
            if (p.id < currentPhase || (p.id === currentPhase && isDone && verifyState === 'MATCH')) {
                p.status = 'STABLE';
            } else if (p.id === currentPhase) {
                p.status = (verifyState === 'FAIL') ? 'FAULT' : 'ACTIVE';
            } else {
                p.status = 'PENDING';
            }
        });
        this.markDirty();
    }

    render() {
        const colors = {
            'PENDING': '\x1B[90m', // Grey
            'ACTIVE': '\x1B[34m',  // Blue
            'STABLE': '\x1B[32m',  // Green
            'FAULT': '\x1B[31m'    // Red
        };

        const parts = this.phases.map(p => {
            const color = colors[p.status];
            const icon = (p.status === 'STABLE') ? '✔' : (p.status === 'FAULT' ? '✘' : (p.status === 'ACTIVE' ? '▶' : '○'));
            return `${color}${icon} ${p.name}\x1B[0m`;
        });

        return [` PHASES: | ${parts.join(' | ')} |`];
    }
}

module.exports = BlockLogicRibbon;
