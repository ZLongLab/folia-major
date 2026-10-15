import { beforeEach, describe, expect, it, vi } from 'vitest';

// 当前文件：更换安卓云端后，旧账号会话不能被送给另一个服务器。
const config = vi.hoisted(() => ({ base: 'https://a.example.com' as string | null }));
vi.mock('../../../src/stores/useAndroidBackendStore', () => ({ getAndroidApiBase: () => config.base }));
vi.mock('../../../src/services/db', () => ({ getFromCache: vi.fn(), saveToCache: vi.fn() }));
import { getProviderCacheKey, readProviderSessionValue, writeProviderSessionValue } from '../../../src/services/onlineMusic/providerStorage';
const values = new Map<string, string>();
beforeEach(() => {
  values.clear(); config.base = 'https://a.example.com';
  vi.stubGlobal('localStorage', { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v) });
});
describe('Android NetEase session scope', () => {
  it('does not reuse a session or account snapshot after changing backend', () => {
    writeProviderSessionValue('netease', 'cookie', 'private-session');
    const previousCache = getProviderCacheKey('netease', 'user_home_snapshot');
    config.base = 'https://b.example.com';
    expect(readProviderSessionValue('netease', 'cookie')).toBeNull();
    expect(getProviderCacheKey('netease', 'user_home_snapshot')).not.toBe(previousCache);
    config.base = 'https://a.example.com';
    expect(readProviderSessionValue('netease', 'cookie')).toBe('private-session');
  });
  it('does not migrate an unscoped cookie on Android', () => {
    values.set('netease_cookie', 'legacy-session');
    expect(readProviderSessionValue('netease', 'cookie', ['netease_cookie'])).toBeNull();
  });
  it('keeps the existing web session behavior', () => {
    config.base = null;
    values.set('netease_cookie', 'legacy-session');
    expect(readProviderSessionValue('netease', 'cookie', ['netease_cookie'])).toBe('legacy-session');
  });
});
