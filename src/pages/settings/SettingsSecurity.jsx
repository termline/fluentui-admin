import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchSecuritySettings, updateSecuritySettings } from '../../api';
import { Button, Field, Input, Switch, Spinner, Toaster, useToastController, Toast, ToastTitle } from '@fluentui/react-components';

const SettingsSecurity = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ passwordPolicy: '', mfaEnabled: false, sessionTimeout: 30 });
  const toasterId = useRef('security-settings-toaster');
  const { dispatchToast } = useToastController(toasterId.current);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSecuritySettings();
      setForm(data);
    } catch (e) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (field) => (e, data) => {
    // Switch 组件 value 在 data.checked, Input 在 e.target.value
    const value = data && Object.prototype.hasOwnProperty.call(data, 'checked') ? data.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field) => (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSecuritySettings(form);
      setForm(updated);
      dispatchToast(
        <Toast appearance="success">
          <ToastTitle>安全设置已保存</ToastTitle>
        </Toast>,
        { intent: 'success' }
      );
    } catch (e) {
      setError(e.message || '保存失败');
      dispatchToast(
        <Toast appearance="error">
          <ToastTitle>保存失败</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0 }}>安全设置</h2>
      <p style={{ marginTop: 0, color: 'var(--colorNeutralForeground3, #555)' }}>配置系统安全相关选项。</p>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="tiny" /> 正在加载...</div>
      )}
      {error && !loading && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
      )}
      {!loading && !error && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="密码策略" hint="例如: 至少8位，包含大小写与数字">
            <Input value={form.passwordPolicy || ''} onChange={handleChange('passwordPolicy')} required />
          </Field>
          <Field label="启用多因素认证 (MFA)">
            <Switch checked={!!form.mfaEnabled} onChange={handleChange('mfaEnabled')} label={form.mfaEnabled ? '已启用' : '未启用'} />
          </Field>
            <Field label="会话超时 (分钟)" hint="用户无操作后自动退出时间">
              <Input type="number" min={1} max={720} value={form.sessionTimeout} onChange={handleNumberChange('sessionTimeout')} required />
            </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button appearance="primary" type="submit" disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
            <Button appearance="secondary" type="button" onClick={load} disabled={loading || saving}>重置</Button>
          </div>
        </form>
      )}
      <Toaster toasterId={toasterId.current} />
    </div>
  );
};

export default SettingsSecurity;
