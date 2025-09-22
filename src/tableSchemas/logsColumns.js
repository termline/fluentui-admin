export const logsColumns = [
  { key: 'id', name: 'ID', sortable: true },
  { key: 'level', name: '级别', sortable: true, render: (row) => row.__levelRender(row) },
  { key: 'content', name: '内容' },
  { key: 'ts', name: '时间', sortable: true, render: (row) => row.__timeRender(row) },
];
