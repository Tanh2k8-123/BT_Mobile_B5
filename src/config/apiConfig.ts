import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_API_URL = '@course_management/api_base_url';

// Default base URL fallback
// On Android emulator, localhost is 10.0.2.2. On Web or desktop, localhost is 127.0.0.1.
export const DEFAULT_LOCAL_API_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

// A placeholder MockAPI URL format as illustrated in the PDF
export const MOCKAPI_SAMPLE_URL = 'https://YOUR_PROJECT_ID.mockapi.io/api/v1';

let cachedBaseUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
    if (saved && saved.trim()) {
      cachedBaseUrl = saved.trim().replace(/\/+$/, '');
      return cachedBaseUrl;
    }
  } catch (e) {
    console.warn('Error reading API base URL from storage:', e);
  }
  cachedBaseUrl = DEFAULT_LOCAL_API_URL;
  return cachedBaseUrl;
}

export async function setApiBaseUrl(newUrl: string): Promise<void> {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEY_API_URL, cleanUrl);
  cachedBaseUrl = cleanUrl;
}

export async function resetApiBaseUrl(): Promise<string> {
  await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
  cachedBaseUrl = DEFAULT_LOCAL_API_URL;
  return cachedBaseUrl;
}
