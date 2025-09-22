import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../api';
import { formatDate } from '../../utils';

const levelColor = { '高': 'red', '中': 'orange', '低': '#999' };

const ServiceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts()
      .then(res => setAlerts(res.data))
      .catch(() => setError('加载告警失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>正在加载告警...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>告警管理</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>级别</th>
            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>服务</th>
            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>描述</th>
            <th style={{ borderBottom: '1px solid #eee', padding: 8 }}>时间</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.id}>
              <td style={{ padding: 8, color: levelColor[a.level] || '#333' }}>{a.level}</td>
              <td style={{ padding: 8 }}>{a.service}</td>
              <td style={{ padding: 8 }}>{a.message}</td>
              <td style={{ padding: 8 }}>{formatDate(a.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceAlerts;
