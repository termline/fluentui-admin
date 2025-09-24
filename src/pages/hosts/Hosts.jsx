import React, { useEffect, useState } from 'react';
import { fetchHosts } from '../../api';
import { formatDate } from '../../utils';
import { Badge } from '@fluentui/react-components';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import DataTable from '../../components/DataTable';
import PageContainer from '../../components/PageContainer';
import { hostsColumns } from '../../tableSchemas/hostsColumns';

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHosts = () => {
    setLoading(true);
    setError(null);
    fetchHosts()
      .then(res => setHosts(res.data))
      .catch(() => setError('加载主机失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHosts();
  }, []);

  if (loading) {
    return (
      <PageContainer title="主机列表">
        <Loading label="正在加载主机列表..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="主机列表"
      subtitle="查看和管理系统中的所有主机"
    >
      <ErrorMessage error={error} onRetry={loadHosts} />
      {!error && (
        <DataTable
          columns={hostsColumns}
          data={hosts.map(h => ({
            ...h,
            __statusRender: () => (
              <Badge 
                appearance={h.status === '维护' ? 'tint' : 'filled'} 
                color={h.status === '维护' ? 'warning' : 'brand'}
              >
                {h.status}
              </Badge>
            ),
            __createdAtRender: () => formatDate(h.createdAt),
          }))}
          emptyText="暂无主机"
          pageSize={20}
          initialSort={{ key: 'name', direction: 'asc' }}
        />
      )}
    </PageContainer>
  );
};

export default Hosts;
