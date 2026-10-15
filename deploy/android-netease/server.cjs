const { createRequire } = require('node:module');
const api = require('@neteasecloudmusicapienhanced/api');

// 当前文件：独立网易云 HTTPS 上游服务，由云平台终止 TLS，启动与健康检查不依赖电脑。
process.env.ENABLE_GENERAL_UNBLOCK = 'false';
process.env.CORS_ALLOW_ORIGIN ||= 'https://localhost';
const apiRequire = createRequire(require.resolve('@neteasecloudmusicapienhanced/api'));
// The upstream logger prints decoded URLs, including cookie query parameters. Keep credentials out of cloud logs.
const logger = apiRequire('./util/logger.js');
for (const level of Object.keys(logger)) logger[level] = () => {};

async function start() {
  const app = await api.server.serveNcmApi({
    port: Number(process.env.PORT || 3000), host: process.env.HOST || '0.0.0.0', checkVersion: false,
  });
  app.get('/healthz', (_req, res) => res.json({ status: 'ok', service: 'folia-netease', apiVersion: '4.41.1' }));
  console.log('Folia NetEase service ready');
  // Key refresh can contact upstream; do it after serving health checks so a slow upstream does not prevent startup.
  const generateConfig = apiRequire('./generateConfig.js');
  // Upstream initialization may log raw request failures. Never log its credential-bearing error objects.
  const previousLog = console.log;
  console.log = (...args) => { if (args.every(arg => typeof arg === 'string')) previousLog(...args); };
  void generateConfig().catch(() => console.warn('NetEase initialization failed; retry by redeploying.'));
  const shutdown = () => app.server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
start().catch(() => { console.error('Folia NetEase startup failed'); process.exit(1); });
