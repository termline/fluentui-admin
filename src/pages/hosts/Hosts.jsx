import React, { useEffect, useState } from 'react';
import { fetchHosts } from '../../api';
import { formatDate } from '../../utils';
import { Badge } from '@fluentui/react-components';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import DataTable from '../../components/DataTable';
import { hostsColumns } from '../../tableSchemas/hostsColumns';

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHosts()
      .then(res => setHosts(res.data))
      .catch(() => setError('加载主机失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>主机列表</h2>
      {loading && <Loading label="正在加载主机列表..." />}
      <ErrorMessage error={error} onRetry={() => { setLoading(true); setError(null); fetchHosts().then(r => setHosts(r.data)).catch(() => setError('加载主机失败')).finally(() => setLoading(false)); }} />
      {!loading && !error && (
        <div style={{ marginTop: 8 }}>
          <DataTable
            columns={hostsColumns}
            data={hosts.map(h => ({
              ...h,
              __statusRender: () => (
                <Badge appearance={h.status === '维护' ? 'tint' : 'filled'} color={h.status === '维护' ? 'warning' : 'brand'}>
                  {h.status}
                </Badge>
              ),
              __createdAtRender: () => formatDate(h.createdAt),
            }))}
            emptyText="暂无主机"
            pageSize={20}
            initialSort={{ key: 'name', direction: 'asc' }}
          />
        </div>
      )}
    </div>
  );
};

export default Hosts;
