# Folia 0.7.19 Android 适配

主工作仓库：https://github.com/ZLongLab/folia-major
基线：main 的 a7574827；package.json 仍为 0.7.19。
工作分支：codex/android-xiaomi-0.7.19。

## 适配范围与参考

先检查根 AGENTS.md、项目 skills、CODEMAP 与当前网易云 Omni 路由。
参考 chthollyphile/folia-sonnet 的原生 android 目录、Capacitor 8.4.2、HTTPS 本地来源和禁用原生包 PWA 注册的做法；
参考提交 5a2c3148cc78c51a5c2df15d7d0d34c120c24873。
没有复制其 0.6.7 前端、业务服务、package.json 或依赖锁文件。
现有 0.7.19 的 Omni、歌词动画和 Web/Electron 分支继续保留。
Capacitor CLI 8.4.2 加载 TS 配置时与本项目 TypeScript 7 不兼容，所以使用 capacitor.config.json。

原生应用标识 io.github.zlonglab.folia；versionName 0.7.19；versionCode 70191。
minSdk 24，compileSdk / targetSdk 36。仅请求联网权限，关闭 Android 自动备份。
本次交付为调试签名 APK，开启 WebView 调试供真机验证；不作为商店发布包。

## D 盘隔离

- 当前源码 D:\MyGithub\folia-major；参考源码 D:\MyGithub\folia-sonnet-reference。
- 依赖为对应源码目录下的 node_modules。
- 工具 D:\Downloads\Folia-Android\toolchain（独立 JDK 21、Android SDK）。
- npm / Gradle / Android 用户目录 / 临时缓存 D:\Caches\Folia-Android。
- APK 与构建日志 D:\Downloads\Folia-Android。
- 原 Windows 安装 D:\Folia 未修改。

## 构建

Node 24+，JDK 21，Android SDK platform 36 与 build-tools 36.0.0。
官方工具下载：Adoptium https://adoptium.net/temurin/releases/?version=21 ；Android https://developer.android.com/studio#command-tools 。
JDK 解压在 toolchain/jdk21/<JDK目录>，SDK 放 toolchain/android-sdk。
新机器先通过 Android 官方工具接受许可并安装平台与构建工具，不能将他人许可目录作为接受许可的替代。

PowerShell（依赖安装前先指定缓存）：

```powershell
Set-Location D:\MyGithub\folia-major
$env:TEMP='D:\Caches\Folia-Android\tmp'
$env:TMP=$env:TEMP
$env:npm_config_cache='D:\Caches\Folia-Android\npm'
New-Item -ItemType Directory -Force $env:TEMP | Out-Null
npm ci --ignore-scripts --no-audit --no-fund
npm run build:android:debug
```

packaging/android/build.ps1 设置本次构建的 JDK、SDK、GRADLE_USER_HOME、ANDROID_USER_HOME、TEMP、npm cache，
执行当前前端编译、cap sync 和 assembleDebug，失败即停止，最后复制 APK 并生成 SHA256。
不修改系统环境变量或全局 npm 设置。Gradle 8.14.3 分发包使用官方 SHA256 校验。

## 云端配置

deploy/android-netease 提供锁定 4.41.1 的独立后端与 Dockerfile；仓库根目录 render.yaml 提供 Render 一键部署配置；没有依赖本地电脑的生产地址。
部署步骤、Vercel 备选和验收见 deploy/android-netease/README.md。
按用户决定，本次先交付 APK 和可部署配置，云账号后续提供；尚未创建或部署实际云服务。

首次打开 APK 填真实公网 HTTPS 网易云 API 根地址；也可点“稍后配置，先预览应用”。
之后从“设置 → 选项 → 集成 → 云端音乐服务”或命令面板“安卓云端接口”重新打开。
只保存 API 地址，网易云账号凭据由既有 provider storage 保存；Android 凭据和账号快照按服务器地址隔离。
不接受 localhost、局域网 HTTP 或 URL 内嵌密钥作为外出使用地址。

## 本次验证

- 已通过：当前前端编译、Capacitor 同步、Gradle assembleDebug、APK v2 签名校验。
- 已通过：TypeScript 类型检查；5 个相关测试文件共 48 项，覆盖地址验证、会话隔离、网易云和命令注册。
- 已通过：待部署后端本机启动，/healthz、https://localhost 的 CORS、搜索和 /login/qr/key。
- 已通过：Xiaomi Pad 7（2410CRP4CC），Android 16，OS3.0.306.0.WOZCNXM，USB 安装与原生冷启动（1514 ms）；首次接口配置页与应用首页显示。
- 真机 APK 的地址 https://localhost/ 是设备内置资源源，不是电脑服务器；原生平台检查为 android / true，没有 PWA controller。
- 待验证：云端正式部署、真实账号扫码登录、歌单、音频与歌词同步、关电脑后使用独立网络。
- 待验证：后台与锁屏连续播放、蓝牙、长时间性能与本地文件扫描；此适配未实现 Android 前台媒体服务。

截图与详细日志在 D:\Downloads\Folia-Android；构建成功不代表网易云账号与音源已验收。
