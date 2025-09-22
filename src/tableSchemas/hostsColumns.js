export const hostsColumns = [
  { key: 'name', name: '主机名' },
  { key: 'ip', name: 'IP 地址' },
  { key: 'status', name: '状态', render: (row) => row.__statusRender(row) },
  { key: 'createdAt', name: '添加时间', render: (row) => row.__createdAtRender(row) },
];
