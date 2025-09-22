// 菜单与权限配置：集中式定义，便于新增/国际化/测试
// 每个条目可选字段：
// key: 唯一标识
// i18nKey: 国际化 key（运行时 t() 解析）
// icon: React 元素（在 Sidebar 中注入）
// path: 直接点击跳转路径（叶子菜单）
// children: 子菜单数组（分组）
// roles: 允许访问的角色列表
// category: 是否为分组分类根（拥有 children）
// section: 顶部/底部或其它分区标记（可扩展）
import {
  Board20Filled,
  People20Filled,
  Settings20Filled,
  Server20Filled,
  DesktopTower20Filled,
  Shield20Filled,
  DocumentBulletListMultiple20Filled,
  DataArea20Filled,
  PersonStar20Filled,
} from '@fluentui/react-icons';
import { PERMISSIONS } from './permissions';

// 说明：原 roles 字段在菜单项中被 required(权限数组) 替代
export const roles = ['admin','auditor','operator','viewer'];

export const menuTree = [
  { key: 'dashboard', i18nKey: 'menu.dashboard', icon: Board20Filled, path: '/', required: [PERMISSIONS.DASHBOARD_VIEW] },
  { key: 'hostCategory', i18nKey: 'menu.host.category', icon: DesktopTower20Filled, required: [PERMISSIONS.HOSTS_READ], children: [
    { key: 'hosts', i18nKey: 'menu.host.list', path: '/hosts', required: [PERMISSIONS.HOSTS_READ] },
    { key: 'addHost', i18nKey: 'menu.host.add', path: '/hosts/add', required: [PERMISSIONS.HOSTS_CREATE] }
  ] },
  { key: 'serviceCategory', i18nKey: 'menu.service.category', icon: Server20Filled, required: [PERMISSIONS.SERVICES_READ], children: [
    { key: 'services', i18nKey: 'menu.service.list', path: '/services', required: [PERMISSIONS.SERVICES_READ] },
    { key: 'serviceAlerts', i18nKey: 'menu.service.alerts', path: '/services/alerts', required: [PERMISSIONS.SERVICES_ALERTS_READ] }
  ] },
  { key: 'logCategory', i18nKey: 'menu.log.category', icon: DocumentBulletListMultiple20Filled, required: [PERMISSIONS.LOGS_READ], children: [
    { key: 'logs', i18nKey: 'menu.log.list', path: '/logs', required: [PERMISSIONS.LOGS_READ] },
    { key: 'logRules', i18nKey: 'menu.log.rules', path: '/logs/rules', required: [PERMISSIONS.LOGRULES_READ] }
  ] },
  { key: 'userCategory', i18nKey: 'menu.user.category', icon: People20Filled, required: [PERMISSIONS.USERS_READ], children: [
    { key: 'users', i18nKey: 'menu.user.users', path: '/users', required: [PERMISSIONS.USERS_READ] },
    { key: 'roles', i18nKey: 'menu.user.roles', path: '/roles', required: [PERMISSIONS.ROLES_MANAGE] }
  ] },
  { key: 'systemCategory', i18nKey: 'menu.system.category', icon: Settings20Filled, required: [PERMISSIONS.SETTINGS_READ], children: [
    { key: 'settings', i18nKey: 'menu.system.settings', path: '/settings', required: [PERMISSIONS.SETTINGS_READ] },
    { key: 'security', i18nKey: 'menu.system.security', path: '/settings/security', required: [PERMISSIONS.SETTINGS_SECURITY_READ] }
  ] },
  { key: 'reports', i18nKey: 'menu.reports', icon: DataArea20Filled, path: '/reports', required: [PERMISSIONS.REPORTS_VIEW], section: 'extra' },
  { key: 'profile', i18nKey: 'menu.profile', icon: PersonStar20Filled, path: '/profile', required: [PERMISSIONS.PROFILE_VIEW], section: 'extra' }
];

export function flattenMenu(tree = menuTree) {
  const flat = [];
  const walk = (items, parentKeys = []) => {
    items.forEach(item => {
      const { children, ...rest } = item;
      const parents = parentKeys.map(p => p.key);
  flat.push({ ...rest, parentKeys: parents, parents });
      if (children) walk(children, [...parentKeys, item]);
    });
  };
  walk(tree, []);
  return flat;
}

export function findMenuByPath(pathname) {
  return flattenMenu().find(m => m.path === pathname);
}
