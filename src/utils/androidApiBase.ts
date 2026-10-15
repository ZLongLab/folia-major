// 当前文件：Android 远端 API 地址验证，防止把电脑回环或局域网地址当成云端服务。
export const normalizeAndroidApiBase = (input: string): string => {
  const url = new URL(input.trim());
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
    || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')
    || !host.includes('.') || host.startsWith('[')
    || /^(127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new Error('ANDROID_API_HTTPS_REQUIRED');
  }
  return url.href.replace(/\/+$/, '');
};
