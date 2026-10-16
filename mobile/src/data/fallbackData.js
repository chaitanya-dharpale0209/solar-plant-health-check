/**
 * Oorjan Mobile Telemetry Data Provider
 * 
 * Automatically loads pre-calculated 90-day solar fleet telemetry,
 * daily Performance Ratios (PR), and detected anomalies (outages, sudden drops, gradual decline).
 */

let fallbackPayload = null;

try {
  // First attempt: local mobile fallback
  fallbackPayload = require('./fallbackData.json');
} catch (e) {
  try {
    // Second attempt: monorepo shared fallback
    fallbackPayload = require('../../../frontend/src/data/fallbackData.json');
  } catch (err) {
    fallbackPayload = null;
  }
}

export default fallbackPayload;
