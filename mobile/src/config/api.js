import { Platform } from 'react-native';

/**
 * HelioPulse Mobile API Configuration
 * 
 * Supports:
 * - Local development:
 *   - Android emulator connects via 10.0.2.2:8000
 *   - iOS simulator / Web connects via localhost:8000
 * - Cloud Production:
 *   - Render or custom URL can be configured below
 * - Smart Offline Fallback:
 *   - Automatically falls back to full local dataset if the backend is unreachable
 */

export const DEFAULT_LOCAL_API = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

// Configure production cloud backend if available (e.g., Render web service)
export const PRODUCTION_API = 'https://solar-plant-health-check.onrender.com';

export const API_CONFIG = {
  baseUrl: DEFAULT_LOCAL_API,
  timeoutMs: 6000,
  useFallbackWhenOffline: true,
};
