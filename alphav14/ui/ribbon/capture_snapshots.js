const RibbonComponent = require('./component');
const styles = require('../framework/styles');
const TuiSnapshot = require('../framework/snapshot');

const snap = new TuiSnapshot();
const mockActive = { id: 0, transferred: 12.5, total: 100.0, unit: "MB", velocity: 5.0, loss: 0.0, status: 'ACTIVE' };
const mockIdle = { id: 0, transferred: 0, total: 0, unit: "MB", velocity: 0, loss: 0, status: 'IDLE' };
const layouts = ['StandardEngineer', 'SpeedFirst', 'NetworkDashboard', 'CompactRibbon', 'MirroredLayout'];

layouts.forEach(layout => {
  ['StyleA', 'StyleB', 'StyleC'].forEach(style => {
    styles.setGlobal(style);
    snap.capture(`ribbon_${layout}_${style}_active`, new RibbonComponent(mockActive, { layout }));
    snap.capture(`ribbon_${layout}_${style}_idle`, new RibbonComponent(mockIdle, { layout }));
  });
});
console.log("Ribbon snapshots re-captured.");
