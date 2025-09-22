export const usersColumns = [
  { key: 'id', name: 'ID', sortable: true },
  { key: 'name', name: '用户名', sortable: true },
  { key: 'email', name: '邮箱' },
  { key: 'role', name: '角色', render: (row) => row.__roleRender(row) },
];
