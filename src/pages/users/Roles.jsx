import React, { useEffect, useState } from 'react';
import { fetchRoles } from '../../api';
import { Spinner, TagGroup, Tag } from '@fluentui/react-components';
import DataTable from '../../components/DataTable';
import { rolesColumns } from '../../tableSchemas/rolesColumns';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoles()
      .then(res => setRoles(res.data))
      .catch(() => setError('加载角色失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="加载角色..." />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>角色管理</h2>
      <DataTable
        columns={rolesColumns}
        data={roles.map(r => ({
          ...r,
          __permissionsRender: () => (
            <TagGroup>
              {r.permissions.slice(0,5).map(p => <Tag key={p}>{p}</Tag>)}
              {r.permissions.length > 5 && <Tag>+{r.permissions.length - 5}</Tag>}
            </TagGroup>
          ),
        }))}
        emptyText="暂无角色"
        pageSize={15}
        initialSort={{ key: 'id', direction: 'asc' }}
      />
    </div>
  );
};

export default Roles;
