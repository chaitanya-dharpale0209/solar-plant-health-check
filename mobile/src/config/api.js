import { Platform, NativeModules } from 'react-native';

/**
 * Auto-detect the host machine's LAN IP when running on a physical phone via Expo Go.
 * In development, scriptURL is e.g. "http://192.168.x.x:8081/index.bundle..."
 */
const getDevServerHost = () => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0];
      const hostname = address?.split(':')[0];
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8000`;
      }
    }
  } catch {
    // fallback to static definitions
  }
  return null;
};

export const DEFAULT_LOCAL_API = getDevServerHost() || Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

// Configure production cloud backend if available (e.g., Render web service)
export const PRODUCTION_API = 'https://solar-plant-health-check.onrender.com';

export const API_CONFIG = {
  baseUrl: PRODUCTION_API,
  timeoutMs: 10000,
  useFallbackWhenOffline: true,
};
