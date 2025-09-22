import React, { useState } from 'react';
import { createHost } from '../../api';
import { Field, Input, Button, Toast, ToastTitle, Toaster, useToastController, useId } from '@fluentui/react-components';

const AddHost = () => {
  const [form, setForm] = useState({ name: '', ip: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toasterId = useId('add-host-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createHost(form);
      dispatchToast(<Toast><ToastTitle>主机已添加</ToastTitle></Toast>);
      setForm({ name: '', ip: '' });
    } catch (e) {
      setError(e.message || '添加失败');
      dispatchToast(<Toast appearance="error"><ToastTitle>添加失败</ToastTitle></Toast>, { intent: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>添加主机</h2>
      <p style={{ marginTop: 0, color: 'var(--colorNeutralForeground3, #555)' }}>填写主机信息并提交。</p>
      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="主机名称" required>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field label="IP 地址" required hint="例如 10.0.0.11">
          <Input name="ip" value={form.ip} onChange={handleChange} pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$" required />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button appearance="primary" type="submit" disabled={submitting}>{submitting ? '提交中...' : '提交'}</Button>
          <Button type="button" onClick={() => setForm({ name: '', ip: '' })} disabled={submitting}>重置</Button>
        </div>
      </form>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default AddHost;
