// 轻量 i18n 工具：支持简单 key -> 文本 映射；后续可替换为专业库 (不依赖外部框架)

const dictionaries = {
  'zh-CN': {
    'app.title': '运维管理控制台',
    'menu.dashboard': '仪表盘',
    'menu.host.category': '主机管理',
    'menu.host.list': '主机列表',
    'menu.host.add': '添加主机',
    'menu.service.category': '服务监控',
    'menu.service.list': '服务列表',
    'menu.service.alerts': '告警管理',
    'menu.log.category': '日志审计',
    'menu.log.list': '日志查询',
    'menu.log.rules': '审计规则',
    'menu.user.category': '用户权限',
    'menu.user.users': '用户管理',
    'menu.user.roles': '角色管理',
    'menu.system.category': '系统设置',
    'menu.system.settings': '基础设置',
    'menu.system.security': '安全设置',
    'menu.reports': '报表分析',
    'menu.profile': '个人中心',
  'menu.section.other': '其他',
    'datatable.export.csv': '导出 CSV',
    'datatable.export.json': '导出 JSON',
    'datatable.column.config': '列配置',
    'datatable.column.selectAll': '全选',
    'datatable.column.clear': '清空',
    'datatable.empty': '暂无数据',
    'datatable.page.prev': '上一页',
    'datatable.page.next': '下一页',
    'common.forbidden': '抱歉，您没有访问此页面的权限。',
  },
  'en-US': {
    'app.title': 'Ops Admin Console',
    'menu.dashboard': 'Dashboard',
    'menu.host.category': 'Host Management',
    'menu.host.list': 'Hosts',
    'menu.host.add': 'Add Host',
    'menu.service.category': 'Service Monitoring',
    'menu.service.list': 'Services',
    'menu.service.alerts': 'Alerts',
    'menu.log.category': 'Log Audit',
    'menu.log.list': 'Logs',
    'menu.log.rules': 'Audit Rules',
    'menu.user.category': 'User & Access',
    'menu.user.users': 'Users',
    'menu.user.roles': 'Roles',
    'menu.system.category': 'System Settings',
    'menu.system.settings': 'Basic Settings',
    'menu.system.security': 'Security',
    'menu.reports': 'Reports',
    'menu.profile': 'Profile',
    'menu.section.other': 'Other',
    'datatable.export.csv': 'Export CSV',
    'datatable.export.json': 'Export JSON',
    'datatable.column.config': 'Columns',
    'datatable.column.selectAll': 'Select All',
    'datatable.column.clear': 'Clear',
    'datatable.empty': 'No Data',
    'datatable.page.prev': 'Prev',
    'datatable.page.next': 'Next',
    'common.forbidden': 'Sorry, you are not authorized to view this page.'
  }
};

let currentLocale = 'zh-CN';

export function setLocale(locale) {
  currentLocale = locale;
  // 简单触发刷新：通过派发自定义事件，组件可选择监听或在全局 store 中集成
  window.dispatchEvent(new CustomEvent('app-locale-changed', { detail: { locale } }));
}

export function t(key, fallback) {
  const dict = dictionaries[currentLocale] || {};
  return dict[key] || fallback || key;
}

export function addMessages(locale, messages) {
  dictionaries[locale] = { ...(dictionaries[locale] || {}), ...messages };
}

export function getLocale() { return currentLocale; }
