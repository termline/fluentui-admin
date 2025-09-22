import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useGlobalStore from '../store';
import AdminLayout from '../layouts/AdminLayout';
import { menuTree, flattenMenu } from '../config/menuConfig';
import { getEffectivePermissions, hasPermission } from '../config/permissions';

// 懒加载页面映射：path -> component (保持与现有 pages 目录一致)
const lazyMap = {
  '/': () => import('../pages/Home'),
  '/reports': () => import('../pages/Reports'),
  '/profile': () => import('../pages/Profile'),
  '/hosts': () => import('../pages/hosts/Hosts'),
  '/hosts/add': () => import('../pages/hosts/AddHost'),
  '/services': () => import('../pages/services/Services'),
  '/services/alerts': () => import('../pages/services/ServiceAlerts'),
  '/logs': () => import('../pages/logs/Logs'),
  '/logs/rules': () => import('../pages/logs/LogRules'),
  '/users': () => import('../pages/users/Users'),
  '/roles': () => import('../pages/users/Roles'),
  '/settings': () => import('../pages/settings/Settings'),
  '/settings/security': () => import('../pages/settings/SettingsSecurity'),
  '/login': () => import('../pages/Login'),
  '/403': () => import('../pages/Forbidden'),
  '/404': () => import('../pages/NotFound'),
};

function lazyPage(path) {
  const loader = lazyMap[path];
  if (!loader) return lazy(() => import('../pages/NotFound'));
  return lazy(loader);
}

// 需要登录的路由包装
function RequireAuth({ children }) {
  const user = useGlobalStore(s => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// 基于菜单配置的权限校验组件；path 需要提供绝对路径
function RequirePermission({ path, children }) {
  const user = useGlobalStore(s => s.user);
  if (!user) return null; // 上层 RequireAuth 已处理
  const perms = getEffectivePermissions(user);
  const flat = useMemo(() => flattenMenu(menuTree), []);
  const item = flat.find(i => i.path === path);
  if (item && !hasPermission(perms, item.required)) return <Navigate to="/403" replace />;
  return children;
}

// 从 menuTree 生成路由定义（仅包含有 path 的叶子）
function GeneratedRoutes() {
  const flat = useMemo(() => flattenMenu(menuTree), []);
  return flat.filter(i => i.path).map(item => {
    const Component = lazyPage(item.path);
    const relativePath = item.path === '/' ? undefined : item.path.replace(/^\//,'');
    if (item.path === '/') {
      return <Route key={item.key} index element={<RequirePermission path={item.path}><Component /></RequirePermission>} />;
    }
    return <Route key={item.key} path={relativePath} element={<RequirePermission path={item.path}><Component /></RequirePermission>} />;
  });
}

const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<div style={{ padding: 32 }}>页面加载中...</div>}>
      <Routes>
        <Route path="/login" element={React.createElement(lazyPage('/login'))} />
        <Route path="/403" element={React.createElement(lazyPage('/403'))} />
        <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <GeneratedRoutes />
          <Route path="*" element={React.createElement(lazyPage('/404'))} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
