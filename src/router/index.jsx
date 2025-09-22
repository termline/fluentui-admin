import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useGlobalStore from '../store';
import AdminLayout from '../layouts/AdminLayout';
import { menuTree, flattenMenu } from '../config/menuConfig';
import { getEffectivePermissions, hasPermission } from '../config/permissions';

// 自动构建懒加载映射：根据 menuTree + 额外路由（登录/错误页）推导，减少重复维护
// 使用 Vite 提供的 import.meta.glob 收集所有页面模块
const pageModules = import.meta.glob('../pages/**/*.jsx');

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildLazyMap() {
  const paths = new Set();
  // 菜单定义的叶子路由
  flattenMenu(menuTree).forEach(item => { if (item.path) paths.add(item.path); });
  // 非菜单但需要的固定路由
  ['/login','/403','/404'].forEach(p => paths.add(p));

  const map = {};
  // 直接存储 import() 函数，React.lazy 需要传入返回 Promise 的函数
  paths.forEach(p => { map[p] = resolveImporterForPath(p); });
  return map;
}

function resolveImporterForPath(routePath) {
  // 特殊直接映射
  const special = {
    '/': '../pages/Home.jsx',
    '/login': '../pages/Login.jsx',
    '/403': '../pages/Forbidden.jsx',
    '/404': '../pages/NotFound.jsx',
  };
  if (special[routePath] && pageModules[special[routePath]]) return pageModules[special[routePath]];

  const trimmed = routePath.replace(/^\//,'');
  const segments = trimmed.split('/');

  // 单段：尝试 顶层文件 / 目录文件
  if (segments.length === 1) {
    const seg = segments[0];
    const base = capitalize(seg);
    const candidates = [
      `../pages/${base}.jsx`, // Reports.jsx
      `../pages/${seg}/${base}.jsx`, // hosts/Hosts.jsx
    ];
    for (const c of candidates) if (pageModules[c]) return pageModules[c];
  } else {
    const first = segments[0];
    const last = segments[segments.length - 1];
    const singularFirst = first.endsWith('s') ? first.slice(0, -1) : first;
    // 组合若干可能命名（经验规则）
    const bases = [
      capitalize(first) + capitalize(last), // SettingsSecurity
      capitalize(singularFirst) + capitalize(last), // ServiceAlerts / LogRules
      capitalize(last) + capitalize(singularFirst), // AddHost
      capitalize(last) + capitalize(first), // AlertsServices (可能无匹配)
    ];
    const uniqueBases = Array.from(new Set(bases));
    const candidates = [];
    uniqueBases.forEach(b => {
      candidates.push(`../pages/${first}/${b}.jsx`); // 放入所属目录
      candidates.push(`../pages/${b}.jsx`); // 顶层兜底
    });
    for (const c of candidates) if (pageModules[c]) return pageModules[c];
  }
  // 最后兜底 NotFound
  return pageModules['../pages/NotFound.jsx'] || (() => import('../pages/NotFound.jsx')); // 理论上 glob 已包含
}

const lazyMap = buildLazyMap();

function lazyPage(path) {
  const importer = lazyMap[path];
  if (!importer) return lazy(() => import('../pages/NotFound.jsx'));
  return lazy(importer);
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

// 预先计算叶子路由（带 path）供 JSX 展开使用
function useLeafRoutes() {
  return useMemo(() => flattenMenu(menuTree).filter(i => i.path), []);
}

const Router = () => {
  const leafRoutes = useLeafRoutes();
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 32 }}>页面加载中...</div>}>
        <Routes>
          <Route path="/login" element={React.createElement(lazyPage('/login'))} />
          <Route path="/403" element={React.createElement(lazyPage('/403'))} />
          <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            {leafRoutes.map(item => {
              const Component = lazyPage(item.path);
              if (item.path === '/') {
                return <Route key={item.key} index element={<RequirePermission path={item.path}><Component /></RequirePermission>} />;
              }
              const relativePath = item.path.replace(/^\//,'');
              return <Route key={item.key} path={relativePath} element={<RequirePermission path={item.path}><Component /></RequirePermission>} />;
            })}
            <Route path="*" element={React.createElement(lazyPage('/404'))} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
