import React, { useEffect, useState } from 'react';
import { fetchServices } from '../../api';
import { Badge } from '@fluentui/react-components';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import DataTable from '../../components/DataTable';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data))
      .catch(() => setError('加载服务失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>服务列表</h2>
      {loading && <Loading label="正在加载服务列表..." />}
      <ErrorMessage error={error} onRetry={() => { setLoading(true); setError(null); fetchServices().then(r => setServices(r.data)).catch(() => setError('加载服务失败')).finally(() => setLoading(false)); }} />
      {!loading && !error && (
        <div style={{ marginTop: 8 }}>
          <DataTable
            columns={[
              { key: 'name', name: '名称' },
              { key: 'status', name: '状态', render: (row) => (
                <Badge appearance={row.status === '告警' ? 'filled' : 'tint'} color={row.status === '告警' ? 'danger' : 'brand'}>
                  {row.status}
                </Badge>
              ) },
              { key: 'uptime', name: '运行时长' },
              { key: 'version', name: '版本' },
            ]}
            data={services}
            emptyText="暂无服务"
          />
        </div>
      )}
    </div>
  );
};

export default Services;
