// 角色工具：在菜单/权限逻辑中统一使用英文代码，显示时再映射中文
export const roleMap = {
  admin: '管理员',
  auditor: '审计',
  operator: '运维',
  viewer: '只读',
};

export const normalizeRole = (r) => {
  if (!r) return 'viewer';
  switch (r) {
    case '管理员':
    case 'admin':
      return 'admin';
    case '审计':
    case 'auditor':
      return 'auditor';
    case '运维':
    case 'operator':
      return 'operator';
    case '只读':
    case 'viewer':
      return 'viewer';
    default:
      return 'viewer';
  }
};

export const roleLabel = (code) => roleMap[code] || code;
export const roleCodes = Object.keys(roleMap);
