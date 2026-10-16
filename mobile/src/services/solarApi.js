import { API_CONFIG, DEFAULT_LOCAL_API, PRODUCTION_API } from '../config/api';
import fallbackPayload from '../data/fallbackData';

let currentBaseUrl = API_CONFIG.baseUrl;

export const setApiUrl = (url) => {
  currentBaseUrl = url.replace(/\/$/, '');
};

export const getApiUrl = () => currentBaseUrl;

/**
 * Check if the backend API is reachable
 */
export const checkApiHealth = async () => {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${currentBaseUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (res.ok) {
      return { online: true, latencyMs: latency, url: currentBaseUrl };
    }
    return { online: false, latencyMs: latency, url: currentBaseUrl, status: res.status };
  } catch (err) {
    return { online: false, latencyMs: Date.now() - start, url: currentBaseUrl, error: err.message };
  }
};

/**
 * Fetch Fleet Overview (All 5 plants + fleet KPIs)
 */
export const fetchFleetOverview = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
    const res = await fetch(`${currentBaseUrl}/plants`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.log('[HelioPulse Mobile] Live API unavailable, activating local telemetry dataset:', err.message);
    if (API_CONFIG.useFallbackWhenOffline && fallbackPayload?.fleet) {
      return { data: fallbackPayload.fleet, isFallback: true };
    }
    throw err;
  }
};

/**
 * Fetch Single Plant Detail with Date Range Filtering
 */
export const fetchPlantDetail = async (plantId, startDate = '', endDate = '') => {
  const upperId = (plantId || 'S1').toUpperCase();
  try {
    let url = `${currentBaseUrl}/plants/${upperId}`;
    const params = [];
    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.log(`[HelioPulse Mobile] Live detail for ${upperId} unavailable, using offline dataset.`);
    if (API_CONFIG.useFallbackWhenOffline && fallbackPayload?.plants?.[upperId]) {
      const rawDetail = JSON.parse(JSON.stringify(fallbackPayload.plants[upperId]));
      
      // Apply date filters locally if provided
      let readings = rawDetail.daily_readings || [];
      if (startDate) {
        readings = readings.filter((r) => r.date >= startDate);
      }
      if (endDate) {
        readings = readings.filter((r) => r.date <= endDate);
      }
      rawDetail.daily_readings = readings;

      let issues = rawDetail.issues || [];
      if (startDate || endDate) {
        issues = issues.filter(
          (iss) =>
            !iss.date ||
            ((!startDate || iss.date >= startDate) && (!endDate || iss.date <= endDate))
        );
      }
      rawDetail.issues = issues;
      rawDetail.filter_start_date = startDate || null;
      rawDetail.filter_end_date = endDate || null;

      return { data: rawDetail, isFallback: true };
    }
    throw err;
  }
};

/**
 * Fetch Data Quality Sanitization Audit Logs
 */
export const fetchQualityLogs = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
    const res = await fetch(`${currentBaseUrl}/data-quality-logs`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (API_CONFIG.useFallbackWhenOffline && fallbackPayload?.quality_logs) {
      return { data: fallbackPayload.quality_logs, isFallback: true };
    }
    return { data: [], isFallback: true };
  }
};
