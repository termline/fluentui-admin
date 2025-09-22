export const rolesColumns = [
  { key: 'id', name: 'ID', sortable: true },
  { key: 'name', name: '角色名称', sortable: true },
  { key: 'permissions', name: '权限', render: (row) => row.__permissionsRender(row) },
];
