/**
 * UTA TUI Shadow Thread (Reactive Witness)
 * @warden-purpose Non-blocking terminal rendering with live register sync.
 */
const { workerData, parentPort } = require('worker_threads');
const SharedTelemetry = require('../tests/framework/SharedTelemetry');
const RLNCDashboard = require('./rlnc_dashboard');

const { sab, config, meta } = workerData;
const telemetry = new SharedTelemetry(sab);
const dashboard = new RLNCDashboard();

const startTime = Date.now();

const interval = setInterval(() => {
  const snapshot = telemetry.getSnapshot();
  
  // Calculate Average Goodput locally
  const elapsedSec = (Date.now() - startTime) / 1000;
  const totalMB = (snapshot.solved * config.TRANSCODE.PIECE_COUNT * config.TRANSCODE.PIECE_SIZE) / 1048576;
  snapshot.goodput.average = elapsedSec > 0 ? (totalMB / elapsedSec).toFixed(2) : '0.00';

  // Session ID fallback to environment if memory not yet synced
  if (snapshot.sessionID === '0x0000' && config.SESSION_ID) {
    snapshot.sessionID = '0x' + config.SESSION_ID.toString(16).toUpperCase().padStart(4, '0');
  }

  dashboard.sync([], snapshot, config, meta);

  if (snapshot.status === 'DONE' || snapshot.status === 'FAIL') {
    clearInterval(interval);
    dashboard.sync([], snapshot, config, meta);
    process.exit(0);
  }
}, 100);

parentPort.on('message', (msg) => {
  if (msg === 'STOP') process.exit(0);
});
