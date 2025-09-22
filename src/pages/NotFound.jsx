import React from 'react';
import { Button } from '@fluentui/react-components';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>页面未找到 (404)</h2>
      <p style={{ color: 'var(--colorNeutralForeground3,#555)' }}>无法匹配路径：<code>{location.pathname}</code></p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Button appearance="primary" onClick={() => navigate('/')}>返回首页</Button>
        <Button onClick={() => navigate(-1)}>返回上一页</Button>
      </div>
    </div>
  );
};

export default NotFound;
