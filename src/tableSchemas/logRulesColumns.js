export const logRulesColumns = [
  { key: 'id', name: 'ID', sortable: true },
  { key: 'name', name: '名称', sortable: true },
  { key: 'pattern', name: '匹配模式', render: (row) => row.__patternRender(row) },
  { key: 'enabled', name: '启用', render: (row) => row.__enabledRender(row) },
];
