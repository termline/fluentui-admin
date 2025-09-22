import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../api';
import { Field, Input, Button, Spinner, Toast, ToastTitle, useId, useToastController, Toaster } from '@fluentui/react-components';

const Settings = () => {
  const [form, setForm] = useState({ siteName: '', language: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const toasterId = useId('settings-toaster');
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    fetchSettings()
      .then(res => setForm(res.data))
      .catch(() => setError('加载设置失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    updateSettings(form)
      .then(() => dispatchToast(<Toast><ToastTitle>保存成功</ToastTitle></Toast>))
      .catch(() => setError('保存失败'))
      .finally(() => setSaving(false));
  };

  if (loading) return <Spinner label="加载设置..." />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>系统设置</h2>
      <Field label="站点名称" required>
        <Input name="siteName" value={form.siteName} onChange={handleChange} />
      </Field>
      <Field label="语言" hint="如 zh-CN / en-US" style={{ marginTop: 12 }}>
        <Input name="language" value={form.language} onChange={handleChange} />
      </Field>
      <Button appearance="primary" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default Settings;
