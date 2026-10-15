import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// 当前文件：验证正式云接口的健康、Android CORS、搜索与二维码生成，不登录或输出凭据。
const input = process.argv[2];
if (!input) throw new Error('Usage: node packaging/android/probe-cloud.mjs HTTPS_API_BASE [REPORT_PATH]');
const base = new URL(input);
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) {
  throw new Error('Provide an HTTPS API root without credentials or query parameters.');
}
const root = base.href.replace(/\/+$/, '');
const results = { apiBase: root, testedAt: new Date().toISOString(), checks: [] };

async function request(endpoint) {
  const response = await fetch(root + endpoint, {
    headers: { Origin: 'https://localhost' }, signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error('API returned non-JSON (HTTP ' + response.status + ')'); }
  if (!response.ok) throw new Error('API returned HTTP ' + response.status);
  if (response.headers.get('access-control-allow-origin') !== 'https://localhost'
    || response.headers.get('access-control-allow-credentials') !== 'true') {
    throw new Error('Missing Android credentialed CORS headers.');
  }
  return body;
}

try {
  let health;
  // Render Free may need a cold start. Retry readiness only; never retry an account mutation.
  for (let attempt = 1; attempt <= 6; attempt++) {
    try { health = await request('/healthz'); break; }
    catch (error) {
      if (attempt === 6) throw error;
      console.log('Waiting for cloud readiness (' + attempt + '/6)');
      await delay(10000);
    }
  }
  if (health.status !== 'ok' || health.service !== 'folia-netease') throw new Error('Unexpected health response');
  results.checks.push({ name: 'health-and-android-cors', passed: true, apiVersion: health.apiVersion });
  const search = await request('/search?keywords=Folia&limit=1');
  if (search.code !== 200 || !Array.isArray(search.result?.songs)) throw new Error('Search failed');
  results.checks.push({ name: 'public-search', passed: true, songsReturned: search.result.songs.length });
  const stamp = Date.now();
  const key = await request('/login/qr/key?timestamp=' + stamp);
  if (!key.data?.unikey) throw new Error('QR key generation failed');
  const qr = await request('/login/qr/create?qrimg=true&key=' + encodeURIComponent(key.data.unikey) + '&timestamp=' + stamp);
  if (!String(qr.data?.qrimg || '').startsWith('data:image/')) throw new Error('QR image generation failed');
  results.checks.push({ name: 'qr-image-generation', passed: true });
  results.accountLogin = 'pending user scan on tablet';
  results.playbackAndLyrics = 'pending signed-in tablet validation';
  results.passed = true;
} catch (error) {
  results.passed = false;
  results.error = error.message;
} finally {
  const output = process.argv[3] || 'D:/Downloads/Folia-Android/cloud-smoke.json';
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
}
if (!results.passed) process.exitCode = 1;
