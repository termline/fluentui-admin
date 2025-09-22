import React, { useState } from 'react';
import useGlobalStore from '../store';
import { mockLogin } from '../api';
import { Field, Input, Button, Toast, ToastTitle, Toaster, useToastController, useId, Persona, Dropdown, Option } from '@fluentui/react-components';
import { roleCodes, roleLabel } from '../utils/roles';

const Profile = () => {
  const { user, setUser } = useGlobalStore();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(user || { name: '', email: '', role: '' });
  const toasterId = useId('profile-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const handleChange = (e) => {
    setLocal(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setUser(local);
      dispatchToast(<Toast><ToastTitle>资料已保存</ToastTitle></Toast>);
      setSaving(false);
    }, 400);
  };

  const handleMockLogin = async () => {
    const desiredRole = local.role || 'admin';
    const res = await mockLogin(local.name || 'user', desiredRole);
    setUser(res.data);
    setLocal(res.data);
    dispatchToast(<Toast><ToastTitle>已模拟登录</ToastTitle></Toast>);
  };

  if (!user) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>个人中心</h2>
        <p>当前未登录，可使用下面按钮模拟登录。</p>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Field label="登录角色" style={{ minWidth:160 }}>
            <Dropdown
              selectedOptions={[local.role]}
              onOptionSelect={(_, data) => setLocal(prev => ({ ...prev, role: data.optionValue }))}
            >
              {roleCodes.map(r => <Option key={r} value={r}>{roleLabel(r)}</Option>)}
            </Dropdown>
          </Field>
          <Button appearance="primary" onClick={handleMockLogin}>模拟登录</Button>
        </div>
        <Toaster toasterId={toasterId} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>个人中心</h2>
      <div style={{ marginBottom: 16 }}>
        <Persona name={local.name || '未命名'} secondaryText={local.email || '无邮箱'} />
      </div>
      <Field label="用户名" required>
        <Input name="name" value={local.name} onChange={handleChange} />
      </Field>
      <Field label="邮箱" style={{ marginTop: 12 }}>
        <Input name="email" value={local.email} onChange={handleChange} type="email" />
      </Field>
      <Field label="角色" style={{ marginTop: 12 }}>
        <Input name="role" value={local.role} onChange={handleChange} disabled />
      </Field>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Button appearance="primary" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
        <Button onClick={() => setLocal(user)}>重置</Button>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default Profile;
