// 示例：统一接口请求模块
// 如果后端尚未就绪，可以使用 mock 模式。
// 通过 .env 中的 VITE_USE_MOCK 控制：不等于 'false' 时启用 mock
// 可配置 VITE_API_BASE_URL 指向后端服务
const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// 延迟函数模拟网络耗时
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Mock 数据集合
const mockDB = {
  hosts: [
    { id: 1, name: 'web-server-1', ip: '10.0.0.11', status: '在线', createdAt: Date.now() - 86400000 },
    { id: 2, name: 'db-server-1', ip: '10.0.0.21', status: '维护', createdAt: Date.now() - 43200000 },
    { id: 3, name: 'cache-node-1', ip: '10.0.0.31', status: '在线', createdAt: Date.now() - 7200000 },
  ],
  services: [
    { id: 'svc-gateway', name: 'API 网关', status: '运行', uptime: '3d 4h', version: '1.4.2' },
    { id: 'svc-auth', name: '认证服务', status: '运行', uptime: '7d 2h', version: '2.1.0' },
    { id: 'svc-task', name: '任务调度', status: '告警', uptime: '12h', version: '0.9.8' },
  ],
  alerts: [
    { id: 101, level: '高', service: '任务调度', message: '任务堆积超过 500 条', time: Date.now() - 3600000 },
    { id: 102, level: '中', service: '认证服务', message: '登录失败率升高', time: Date.now() - 5400000 },
  ],
  logs: Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    level: ['INFO', 'WARN', 'ERROR'][i % 3],
    content: `示例日志内容 ${i + 1}`,
    ts: Date.now() - i * 60000,
  })),
  logRules: [
    { id: 1, name: '错误关键字监控', pattern: 'ERROR', enabled: true },
    { id: 2, name: '登录失败报警', pattern: 'login failed', enabled: true },
  ],
  users: [
    { id: 1, name: 'admin', email: 'admin@example.com', role: '管理员' },
    { id: 2, name: 'ops01', email: 'ops01@example.com', role: '运维' },
  ],
  roles: [
    { id: 1, name: '管理员', permissions: ['*'] },
    { id: 2, name: '运维', permissions: ['hosts.read', 'services.read'] },
  ],
  settings: { siteName: '运维管理控制台', language: 'zh-CN' },
  settingsSecurity: { mfa: true, passwordPolicy: '长度≥8，含数字与字母' },
  reports: { hostsOnline: 12, servicesRunning: 8, alerts24h: 3 },
};

// 通用 mock 响应封装
async function mockResponse(data, fail = false) {
  await delay();
  if (fail) throw new Error('Mock 请求失败');
  return { data };
}

// Hosts
export const fetchHosts = () => isMock ? mockResponse(mockDB.hosts) : fetch(`${API_BASE}/api/hosts`).then(r => r.json());
export const createHost = (host) => {
  if (isMock) {
    const newHost = { id: Date.now(), createdAt: Date.now(), status: '在线', ...host };
    mockDB.hosts.push(newHost);
    return mockResponse(newHost);
  }
  return fetch('/api/hosts', { method: 'POST', body: JSON.stringify(host) }).then(r => r.json());
};

// Services & Alerts
export const fetchServices = () => isMock ? mockResponse(mockDB.services) : fetch(`${API_BASE}/api/services`).then(r => r.json());
export const fetchAlerts = () => isMock ? mockResponse(mockDB.alerts) : fetch(`${API_BASE}/api/alerts`).then(r => r.json());

// Logs
export const fetchLogs = (keyword = '') => {
  if (isMock) {
    const list = keyword ? mockDB.logs.filter(l => l.content.includes(keyword)) : mockDB.logs;
    return mockResponse(list);
  }
  return fetch(`${API_BASE}/api/logs`).then(r => r.json());
};
export const fetchLogRules = () => isMock ? mockResponse(mockDB.logRules) : fetch(`${API_BASE}/api/log-rules`).then(r => r.json());

// Users & Roles
export const fetchUsers = () => isMock ? mockResponse(mockDB.users) : fetch(`${API_BASE}/api/users`).then(r => r.json());
export const fetchRoles = () => isMock ? mockResponse(mockDB.roles) : fetch(`${API_BASE}/api/roles`).then(r => r.json());

// Settings
export const fetchSettings = () => isMock ? mockResponse(mockDB.settings) : fetch(`${API_BASE}/api/settings`).then(r => r.json());
export const updateSettings = (data) => {
  if (isMock) {
    Object.assign(mockDB.settings, data);
    return mockResponse(mockDB.settings);
  }
  return fetch(`${API_BASE}/api/settings`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json());
};
export const fetchSecuritySettings = () => isMock ? mockResponse(mockDB.settingsSecurity) : fetch(`${API_BASE}/api/settings/security`).then(r => r.json());
export const updateSecuritySettings = (data) => {
  if (isMock) {
    Object.assign(mockDB.settingsSecurity, data);
    return mockResponse(mockDB.settingsSecurity);
  }
  return fetch(`${API_BASE}/api/settings/security`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json());
};

// Reports
export const fetchReports = () => isMock ? mockResponse(mockDB.reports) : fetch(`${API_BASE}/api/reports`).then(r => r.json());

// Auth (示例): 返回统一英文角色代码，UI 层可再映射中文
// mockLogin 现在可选第三参数 permissions: string[] 覆盖或追加权限
export const mockLogin = (name = 'admin', role = 'admin', permissions) => {
  const user = { name, email: `${name}@example.com`, role };
  if (Array.isArray(permissions)) user.permissions = permissions;
  return mockResponse(user);
};

// 导出 mockDB 仅用于调试
export const __mockDB = mockDB;
