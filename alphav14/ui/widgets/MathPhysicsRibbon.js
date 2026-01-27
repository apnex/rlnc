const { TuiWidget } = require('../framework/widget');

/**
 * Math Physics Ribbon: Visualizes the 4 phases of Laboratory drivers.
 * @version 2.1.0 - SLOT-AWARE
 * @pillar Pillar 4: Symmetric Perception
 */
class MathPhysicsRibbon extends TuiWidget {
    constructor(options = {}) {
        super({ id: 'math-physics-ribbon', ...options });
        this.driverType = -1;
        this.phases = [];
        
        this.LABELS = {
            0: ['XOR-STRESS', 'SBOX-SCAN', 'ALIGN-JITTER', 'INV-PROOF'],
            1: ['LOAD-STRIDE', 'ALIGN-TEST', 'BUFFER-STRESS', 'PARITY-AUDIT'],
            2: ['SYS-PASS', 'CODED-STRESS', 'LINEAR-DEP', 'BIT-FIDELITY'],
            3: ['SLICE-PULSE', 'ASSEMBLY', 'HANDLE-GC', 'FULL-STREAM']
        };
    }

    _initializePhases(type) {
        if (this.driverType === type) return;
        this.driverType = type;
        const labels = this.LABELS[type] || ['PHASE-1', 'PHASE-2', 'PHASE-3', 'PHASE-4'];
        this.phases = labels.map((name, i) => ({
            id: i + 1,
            name: name,
            status: 'PENDING'
        }));
    }

    update(fabricState) {
        const activeSlots = fabricState.slots.filter(s => s.status !== 'DORMANT' && s.sessionId !== '0x0');
        if (activeSlots.length === 0) return;

        // Induction: Initialize labels based on the first active slot's driver
        this._initializePhases(activeSlots[0].driverType);

        // SYMMETRY MAPPING: 
        // If multiple slots are active, map Phase[i] to Slot[i].
        // If only one slot is active, map all phases to that singular Slot's phaseId.
        const isMultiSlot = activeSlots.length > 1;

        this.phases.forEach((p, index) => {
            const slot = isMultiSlot ? fabricState.slots[index] : activeSlots[0];
            if (!slot || slot.status === 'DORMANT') {
                p.status = 'PENDING';
                return;
            }

            const currentPhaseId = slot.phaseId || 0;
            const verifyState = slot.verifyState;
            const isDone = slot.status === 'IDLE';

            if (isMultiSlot) {
                // In multi-slot mode, each slot IS a phase
                if (isDone && verifyState === 'MATCH') {
                    p.status = 'STABLE';
                } else if (slot.status === 'RUNNING') {
                    p.status = (verifyState === 'FAIL') ? 'FAULT' : 'ACTIVE';
                } else if (verifyState === 'FAIL') {
                    p.status = 'FAULT';
                } else {
                    p.status = 'PENDING';
                }
            } else {
                // In single-slot mode, we follow the internal phaseId
                if (p.id < currentPhaseId || (p.id === currentPhaseId && isDone && verifyState === 'MATCH')) {
                    p.status = 'STABLE';
                } else if (p.id === currentPhaseId) {
                    p.status = (verifyState === 'FAIL') ? 'FAULT' : 'ACTIVE';
                } else {
                    p.status = 'PENDING';
                }
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

module.exports = MathPhysicsRibbon;
