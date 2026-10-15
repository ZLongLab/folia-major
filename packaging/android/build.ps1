param(
    [string]$ToolchainRoot = 'D:\Downloads\Folia-Android\toolchain',
    [string]$CacheRoot = 'D:\Caches\Folia-Android',
    [string]$OutputDirectory = 'D:\Downloads\Folia-Android'
)
# 当前文件：Windows 可重复构建入口，所有可配置依赖与缓存留在 D 盘。
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
foreach ($dir in @($ToolchainRoot, $CacheRoot, $OutputDirectory)) {
    if ([IO.Path]::GetPathRoot([IO.Path]::GetFullPath($dir)) -ne 'D:\') { throw 'Use D: for Folia toolchains, caches and output.' }
}
$jdk = Get-ChildItem (Join-Path $ToolchainRoot 'jdk21') -Directory | Select-Object -First 1
if (!$jdk) { throw 'Install JDK 21 under ToolchainRoot/jdk21 first; see ANDROID_PORT.md.' }
$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = Join-Path $ToolchainRoot 'android-sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USER_HOME = Join-Path $CacheRoot 'gradle'
$env:ANDROID_USER_HOME = Join-Path $CacheRoot 'android'
$env:TEMP = Join-Path $CacheRoot 'tmp'
$env:TMP = $env:TEMP
$env:npm_config_cache = Join-Path $CacheRoot 'npm'
$env:ELECTRON_SKIP_BINARY_DOWNLOAD = '1'
New-Item -ItemType Directory -Force $env:TEMP, $env:ANDROID_USER_HOME, $OutputDirectory | Out-Null
Push-Location $repoRoot
try {
    Set-Content -LiteralPath 'android/local.properties' -Value ('sdk.dir=' + $env:ANDROID_HOME.Replace('\','/')) -Encoding Ascii
    & npm.cmd run cap:sync:android
    if ($LASTEXITCODE -ne 0) { throw 'Web build or Capacitor sync failed.' }
    Push-Location android
    try {
        & .\gradlew.bat assembleDebug --no-daemon
        if ($LASTEXITCODE -ne 0) { throw 'Gradle APK build failed.' }
    } finally { Pop-Location }
    $version = (Get-Content package.json -Raw | ConvertFrom-Json).version
    $target = Join-Path $OutputDirectory "Folia-$version-android-debug.apk"
    Copy-Item -LiteralPath 'android/app/build/outputs/apk/debug/app-debug.apk' -Destination $target -Force
    $stream = [IO.File]::OpenRead($target)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $hash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
    finally { $stream.Dispose(); $sha.Dispose() }
    Set-Content -LiteralPath "$target.sha256" -Value "$hash  $([IO.Path]::GetFileName($target))" -Encoding Ascii
    Write-Output "APK: $target"
    Write-Output "SHA256: $hash"
} finally { Pop-Location }
