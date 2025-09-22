// 权限与角色策略配置
// 定义原子权限常量，后续可用于服务端下发或前端静态校验
// 命名规范：资源.动作 (.子域) 例如 hosts.read / hosts.create / settings.security.read

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  HOSTS_READ: 'hosts.read',
  HOSTS_CREATE: 'hosts.create',
  SERVICES_READ: 'services.read',
  SERVICES_ALERTS_READ: 'services.alerts.read',
  LOGS_READ: 'logs.read',
  LOGRULES_READ: 'logs.rules.read',
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  SETTINGS_READ: 'settings.read',
  SETTINGS_SECURITY_READ: 'settings.security.read',
  REPORTS_VIEW: 'reports.view',
  PROFILE_VIEW: 'profile.view',
};

// 角色 -> 权限策略；可从服务端动态拉取并缓存
// admin 使用 '*' 代表所有权限
export const rolePolicies = {
  admin: ['*'],
  auditor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SERVICES_READ,
    PERMISSIONS.SERVICES_ALERTS_READ,
    PERMISSIONS.LOGS_READ,
    PERMISSIONS.LOGRULES_READ,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.PROFILE_VIEW,
  ],
  operator: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.HOSTS_READ,
    PERMISSIONS.HOSTS_CREATE,
    PERMISSIONS.SERVICES_READ,
    PERMISSIONS.SERVICES_ALERTS_READ,
    PERMISSIONS.LOGS_READ,
    PERMISSIONS.PROFILE_VIEW,
  ],
  viewer: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
  ],
};

export function getPermissionsByRole(role) {
  if (!role) return new Set();
  const list = rolePolicies[role] || [];
  return new Set(list);
}

// 计算最终权限：若 user.permissions 存在则与角色策略合并（或覆盖）
// 规则：包含 '*' 直接全权限；若 user.permissions 指定则取并集（可通过传 override=true 改为覆盖策略）
export function getEffectivePermissions(user, { override = false } = {}) {
  if (!user) return new Set();
  const roleSet = getPermissionsByRole(user.role);
  const custom = Array.isArray(user.permissions) ? new Set(user.permissions) : new Set();
  if (custom.has('*')) return new Set(['*']);
  if (override) return custom.size ? custom : roleSet;
  // union
  const union = new Set([...roleSet, ...custom]);
  return union;
}

export function hasPermission(userPermissions, required) {
  if (!required || required.length === 0) return true;
  if (userPermissions.has('*')) return true;
  return required.some(r => userPermissions.has(r));
}

export function hasAllPermissions(userPermissions, required) {
  if (!required || required.length === 0) return true;
  if (userPermissions.has('*')) return true;
  return required.every(r => userPermissions.has(r));
}
