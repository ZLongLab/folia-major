import { describe, expect, it } from 'vitest';
import { normalizeAndroidApiBase } from '../../../src/utils/androidApiBase';

// 当前文件：外出可用的 API 地址必须为公网 HTTPS，拒绝携带密钥的地址。
describe('Android cloud API address', () => {
  it('normalizes an HTTPS root or a proxy path', () => {
    expect(normalizeAndroidApiBase(' https://music.example.com/ ')).toBe('https://music.example.com');
    expect(normalizeAndroidApiBase('https://music.example.com/netease/')).toBe('https://music.example.com/netease');
  });
  it.each(['http://music.example.com', 'https://localhost', 'https://127.0.0.1',
    'https://192.168.1.1', 'https://172.16.1.1', 'https://10.0.0.2', 'https://[::1]',
    'https://user:pass@music.example.com', 'https://music.example.com?token=x', 'https://music.example.com/#x'])('rejects %s', value => {
    expect(() => normalizeAndroidApiBase(value)).toThrow();
  });
});
