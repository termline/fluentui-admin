import React, { useEffect, useState, useCallback } from 'react';
import { fetchReports } from '../api';
import { Card, CardHeader, CardFooter, Button, Spinner, Text } from '@fluentui/react-components';

const metricStyle = { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 16 };

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReports()
      .then(res => setData(res.data))
      .catch(e => setError(e.message || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>报表分析</h2>
      <p style={{ marginTop: 0, color: 'var(--colorNeutralForeground3, #555)' }}>展示运维相关的实时统计指标。</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button appearance="primary" onClick={load} disabled={loading}>{loading ? '刷新中...' : '刷新'}</Button>
      </div>
      {loading && <div style={{ marginTop: 16 }}><Spinner size="tiny" label="加载统计数据..." /></div>}
      {error && !loading && <div style={{ color: 'crimson', marginTop: 16 }}>{error}</div>}
      {!loading && !error && data && (
        <div style={metricStyle}>
          <Card>
            <CardHeader header={<Text weight="semibold">在线主机</Text>} />
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center', padding: '12px 0' }}>{data.hostsOnline}</div>
            <CardFooter><Text size={200}>当前被监控的在线主机数</Text></CardFooter>
          </Card>
          <Card>
            <CardHeader header={<Text weight="semibold">运行服务</Text>} />
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center', padding: '12px 0' }}>{data.servicesRunning}</div>
            <CardFooter><Text size={200}>当前处于运行状态的核心服务</Text></CardFooter>
          </Card>
          <Card>
            <CardHeader header={<Text weight="semibold">24h 告警</Text>} />
            <div style={{ fontSize: 32, fontWeight: 600, textAlign: 'center', padding: '12px 0' }}>{data.alerts24h}</div>
            <CardFooter><Text size={200}>最近 24 小时产生的告警数量</Text></CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
