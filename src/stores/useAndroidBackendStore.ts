import { create } from 'zustand';
import { isCapacitorAndroid } from '../platform/android';
import { normalizeAndroidApiBase } from '../utils/androidApiBase';

// 当前文件：仅在 Android 保存云端 API 地址；会话始终按服务地址隔离。
const storageKey = 'folia_android_netease_api_base';
export const getAndroidApiBase = (): string | null => {
  if (!isCapacitorAndroid()) return null;
  try {
    const value = localStorage.getItem(storageKey) || import.meta.env.VITE_NETEASE_API_BASE;
    return value ? normalizeAndroidApiBase(value) : null;
  } catch { return null; }
};
export const useAndroidBackendStore = create<{ open: boolean; show: () => void; hide: () => void }>(set => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
export const saveAndroidApiBase = (value: string): void => {
  const base = normalizeAndroidApiBase(value);
  const previous = getAndroidApiBase();
  if (previous !== base) {
    // Changing servers must never send a previous server's login cookie to a new host.
    for (const key of ['online_provider:netease:cookie', 'online_provider:netease:anonymous_cookie',
      'netease_cookie', 'netease_anonymous_cookie']) localStorage.removeItem(key);
  }
  localStorage.setItem(storageKey, base);
};
