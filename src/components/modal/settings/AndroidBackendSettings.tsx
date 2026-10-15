import React from 'react';
import { useTranslation } from 'react-i18next';
import { isCapacitorAndroid } from '../../../platform/android';
import { useAndroidBackendStore } from '../../../stores/useAndroidBackendStore';

// 当前文件：安卓接口配置的设置入口，与命令面板使用同一平台判断。
export default function AndroidBackendSettings() {
  const { t } = useTranslation();
  if (!isCapacitorAndroid()) return null;
  return <button type="button" onClick={() => useAndroidBackendStore.getState().show()}
    style={{ padding: 16, border: '1px solid currentColor', borderRadius: 12, marginBottom: 16 }}>
    {t('androidBackend.settings')}
  </button>;
}
