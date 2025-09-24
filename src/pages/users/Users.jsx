import React, { useEffect, useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { fetchUsers } from '../../api';
import { Spinner, Badge } from '@fluentui/react-components';
import DataTable from '../../components/DataTable';
import ErrorMessage from '../../components/ErrorMessage';
import PageContainer from '../../components/PageContainer';
import { usersColumns } from '../../tableSchemas/usersColumns';

const useStyles = makeStyles({
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  }
});

const roleColor = {
  '管理员': 'brand',
  '运维': 'informative',
};

const Users = () => {
  const styles = useStyles();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('加载用户失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <PageContainer title="用户管理">
        <div className={styles.loadingContainer}>
          <Spinner label="加载用户..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="用户管理"
      subtitle="管理系统用户账户和权限"
    >
      <ErrorMessage error={error} onRetry={loadUsers} />
      {!error && (
        <DataTable
          columns={usersColumns}
          data={users.map(u => ({
            ...u,
            __roleRender: () => (
              <Badge 
                appearance="tint" 
                color={roleColor[u.role] || 'neutral'}
              >
                {u.role}
              </Badge>
            ),
          }))}
          emptyText="暂无用户"
          pageSize={15}
          initialSort={{ key: 'id', direction: 'asc' }}
        />
      )}
    </PageContainer>
  );
};

export default Users;
