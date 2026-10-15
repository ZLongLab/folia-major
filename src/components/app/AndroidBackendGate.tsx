import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isCapacitorAndroid } from '../../platform/android';
import { getAndroidApiBase, saveAndroidApiBase, useAndroidBackendStore } from '../../stores/useAndroidBackendStore';

// 当前文件：Android 首次启动配置与后续接口编辑；未部署时允许先预览本地界面。
export default function AndroidBackendGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { open, hide } = useAndroidBackendStore();
  const [skipped, setSkipped] = useState(false);
  const [value, setValue] = useState(() => getAndroidApiBase() || '');
  const [error, setError] = useState(false);
  if (!isCapacitorAndroid()) return <>{children}</>;
  const required = !getAndroidApiBase() && !skipped;
  if (!required && !open) return <>{children}</>;
  return <div role="dialog" aria-modal="true" aria-label={t('androidBackend.title')}
    style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'Canvas', color: 'CanvasText', colorScheme: 'dark light', display: 'grid', placeItems: 'center', padding: 'max(24px, env(safe-area-inset-top)) 24px', overflow: 'auto' }}>
    <form style={{ maxWidth: 520, width: '100%', display: 'grid', gap: 18 }} onSubmit={event => {
      event.preventDefault();
      try { saveAndroidApiBase(value); window.location.reload(); } catch { setError(true); }
    }}>
      <h1 style={{ fontSize: 28 }}>{t('androidBackend.title')}</h1>
      <p>{t('androidBackend.description')}</p>
      <label htmlFor="android-api-base">{t('androidBackend.label')}</label>
      <input id="android-api-base" type="url" value={value} autoComplete="off" placeholder="https://"
        onChange={event => { setValue(event.target.value); setError(false); }}
        style={{ padding: 14, border: '1px solid currentColor', borderRadius: 10, background: 'Field', color: 'FieldText' }} />
      {error && <p role="alert">{t('androidBackend.invalid')}</p>}
      <p>{t('androidBackend.privacy')}</p>
      <button type="submit" style={{ padding: 14, border: '1px solid currentColor', borderRadius: 10 }}>{t('androidBackend.save')}</button>
      <button type="button" onClick={() => { setSkipped(true); hide(); }} style={{ padding: 12 }}>{t('androidBackend.later')}</button>
    </form>
  </div>;
}
