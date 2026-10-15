# Folia Android 网易云接口

状态：配置已准备；尚未部署到云账号。此目录独立部署，不需要电脑持续运行。

固定依赖：与当前 Folia 锁文件一致的 @neteasecloudmusicapienhanced/api 4.41.1。
不解锁付费资源；账号扫码和音乐权限由网易云决定。

## Render（Docker）

[部署到自己的 Render 账号](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FZLongLab%2Ffolia-major%2Ftree%2Fcodex%2Fandroid-xiaomi-0.7.19)

配置固定使用安卓分支、免费实例和新加坡区域；自动部署关闭。

导入 ZLongLab/folia-major 的 codex/android-xiaomi-0.7.19 分支，Blueprint 文件使用仓库根目录 render.yaml。
也可手动创建 Web Service：Dockerfile 路径 deploy/android-netease/Dockerfile，Docker context deploy/android-netease。
健康检查 /healthz；CORS_ALLOW_ORIGIN=https://localhost；ENABLE_GENERAL_UNBLOCK=false。
只有云平台显示部署成功且公网 HTTPS 健康检查成功，才能把实际根地址填入 APK。
免费实例可能休眠，首次唤醒期间扫码可能超时，需要唤醒后重新生成二维码。

## 自有服务器

在此目录执行 docker build -t folia-netease .，然后 docker run -d --name folia-netease -p 127.0.0.1:3000:3000 --restart unless-stopped folia-netease。
使用反向代理配置自己的域名与 HTTPS，再把公网 HTTPS 根地址填入平板。
请关闭代理的完整请求 URL 日志，cookie 查询参数可能含登录凭据。

## Vercel 备选

若后续选择 Vercel，请部署增强版接口官方仓库 https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced ，
不要把本目录的常驻 Node 进程直接当成 Vercel Function。
同样配置 CORS_ALLOW_ORIGIN=https://localhost 和 ENABLE_GENERAL_UNBLOCK=false。
平台的部署保护必须允许平板访问 API，不能让 API 返回云平台登录页面。

## 验收

1. 用 Origin: https://localhost 请求 /healthz，确认 JSON 与 Access-Control-Allow-Origin、Access-Control-Allow-Credentials。
2. 请求 /search?keywords=...，确认返回歌曲；/login/qr/key 返回 key，/login/qr/create 返回二维码。
3. 在网易云 App 扫码确认；平板显示账户与歌单，退出重开仍能恢复登录。
4. 播放账号有权限的歌曲，确认歌词推进、拖动进度、切歌。
5. 关闭电脑，平板切换独立网络再次验证 2-4，才算完成离开电脑的验收。

本次不保存任何真实账号 cookie。扫码确认必须由账号所有者在网易云 App 完成。
