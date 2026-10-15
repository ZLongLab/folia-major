import { Capacitor } from '@capacitor/core';

// 当前文件：仅识别原生 Android 容器，不冒充 Electron。
export const isCapacitorAndroid = (): boolean => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
