/**
 * Fabric Scraper: Registers to UI Model Transformer
 * DOUBLE-WORD EDITION: Reassembles 64-bit telemetry from 32-bit registers.
 */
class FabricScraper {
  constructor(backplane) {
    this.pcb = backplane;
  }

  scrape() {
    const slots = [];
    const maxSlots = this.pcb.MAX_SLOTS || 4;
    let totalFabricBytes = 0;

    const V_STATES = ["PENDING", "HASHING", "MATCH", "FAIL"];
    const read64 = (slot, loOff, hiOff) => {
        const lo = this.pcb.getRegister(slot, loOff) >>> 0;
        const hi = this.pcb.getRegister(slot, hiOff) >>> 0;
        return Number((BigInt(hi) << 32n) | BigInt(lo));
    };

    for (let i = 1; i <= maxSlots; i++) {
      const sessionId = this.pcb.getRegister(i, this.pcb.REG_SESSION_ID); 
      
      if (sessionId === 0) {
        slots.push({ slot: i, status: 'DORMANT' });
        continue;
      }

      const snapshot = this.pcb.getSnapshot(i);
      const fabricMicros = read64(i, this.pcb.REG_FABRIC_LO, this.pcb.REG_FABRIC_HI);
      totalFabricBytes += snapshot.bytes;
      
      slots.push({
        slot: i,
        sessionId: "0x" + (sessionId >>> 0).toString(16).toUpperCase(),
        pieceCount: snapshot.pieceCount,
        pieceSize: snapshot.pieceSize,
        solved: snapshot.solved,
        total: snapshot.total,
        bytes: snapshot.bytes,
        fabricMicros,
        startTime: snapshot.startTime,
        endTime: snapshot.endTime,
        intensity: snapshot.intensity,
        driverType: this.pcb.getRegister(i, this.pcb.REG_DRIVER_TYPE),
        phaseId: snapshot.phaseId,
        rank: snapshot.rank,
        verifyState: snapshot.verifyState,
        status: snapshot.status
      });
    }

    const globalErr = this.pcb.getPortRegister(this.pcb.P0_ERRV); 
    const heartbeat = this.pcb.getPortRegister(this.pcb.P0_HB); 

    return {
      metadata: {
        version: "v1.5.0",
        heartbeat,
        errVector: "0x" + globalErr.toString(16).toUpperCase(),
        slotCount: maxSlots,
        totalBytes: totalFabricBytes
      },
      slots,
      health: {
        error: globalErr > 0,
        errCode: globalErr
      }
    };
  }
}

module.exports = FabricScraper;
