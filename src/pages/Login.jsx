import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useGlobalStore from '../store';
import { mockLogin } from '../api';
import { Field, Input, Button, Dropdown, Option, Card, CardHeader, Text } from '@fluentui/react-components';
import { roleCodes, roleLabel } from '../utils/roles';

const cardStyle = { maxWidth: 420, margin: '60px auto', padding: 24 };

export default function Login() {
  const { user, setUser } = useGlobalStore();
  const [form, setForm] = useState({ name: 'admin', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await mockLogin(form.name, form.role);
    setUser(res.data);
    setLoading(false);
    navigate('/');
  };

  return (
    <Card style={cardStyle}>
      <CardHeader header={<Text weight="semibold">登录</Text>} />
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="用户名">
          <Input name="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field label="角色">
          <Dropdown selectedOptions={[form.role]} onOptionSelect={(_, d) => setForm(p => ({ ...p, role: d.optionValue }))}>
            {roleCodes.map(r => <Option key={r} value={r}>{roleLabel(r)}</Option>)}
          </Dropdown>
        </Field>
        <Button appearance="primary" type="submit" disabled={loading}>{loading ? '登录中...' : '登录'}</Button>
      </form>
    </Card>
  );
}
