import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../../api';
import { Spinner, Badge } from '@fluentui/react-components';
import DataTable from '../../components/DataTable';
import { usersColumns } from '../../tableSchemas/usersColumns';

const roleColor = {
  '管理员': 'brand',
  '运维': 'informative',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('加载用户失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="加载用户..." />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>用户管理</h2>
      <DataTable
        columns={usersColumns}
        data={users.map(u => ({
          ...u,
          __roleRender: () => <Badge appearance="tint" color={roleColor[u.role] || 'neutral'}>{u.role}</Badge>,
        }))}
        emptyText="暂无用户"
        pageSize={15}
        initialSort={{ key: 'id', direction: 'asc' }}
      />
    </div>
  );
};

export default Users;
