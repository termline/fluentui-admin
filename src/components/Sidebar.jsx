import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavDrawer, NavDrawerBody, NavDrawerHeader, NavItem, NavSectionHeader, NavDivider, NavCategory, NavCategoryItem, NavSubItemGroup, NavSubItem } from '@fluentui/react-components';
import useGlobalStore from '../store';
import { menuTree } from '../config/menuConfig';
import { getEffectivePermissions, hasPermission } from '../config/permissions';
import { t } from '../i18n';

// 过滤菜单：根据权限 required vs 用户权限集合
function filterMenu(tree, permissionsSet) {
  return tree
    .filter(item => hasPermission(permissionsSet, item.required))
    .map(item => {
      if (item.children) {
        const children = item.children.filter(c => hasPermission(permissionsSet, c.required));
        if (!children.length) return null;
        return { ...item, children };
      }
      return item;
    })
    .filter(Boolean);
}

const Sidebar = () => {
  const user = useGlobalStore(s => s.user);
  const role = user?.role || 'viewer';
  const permissionsSet = getEffectivePermissions(user);
  const navigate = useNavigate();
  const location = useLocation();

  const filtered = filterMenu(menuTree, permissionsSet);

  // 展开状态持久化
  const STORAGE_KEY = 'sidebar.openCategories';
  const [openCategories, setOpenCategories] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    // 默认：若当前路径属于某分类，则该分类展开
    const activeParent = filtered.find(i => i.children && i.children.some(c => c.path === location.pathname));
    return activeParent ? new Set([activeParent.key]) : new Set();
  });

  const persist = useCallback((nextSet) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(nextSet))); } catch(e) { /* ignore */ }
  }, []);

  const toggleCategory = (key) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      persist(next);
      return next;
    });
  };

  // refs to category buttons to simulate click for restoring expansion
  const categoryRefs = useRef({});

  useEffect(() => {
    // try expand for stored categories if not already expanded
    openCategories.forEach(key => {
      const el = categoryRefs.current[key];
      if (el && el.getAttribute('aria-expanded') === 'false') {
        el.click();
      }
    });
  }, []); // run once after mount

  // 根据 section 字段拆分
  const mainItems = [];
  const otherItems = [];
  filtered.forEach(item => {
    if (!item.children && item.section === 'extra') otherItems.push(item); else if (item.section === 'extra' && item.children) {
      // 若未来支持整分类放入 extra，可在此处理；当前无此需求
      otherItems.push(item);
    } else {
      mainItems.push(item);
    }
  });

  const renderLeaf = (item, isSub = false) => {
    const active = item.path && location.pathname === item.path;
    const commonProps = {
      onClick: () => item.path && navigate(item.path),
      'aria-current': active ? 'page' : undefined,
      style: active ? (isSub ? activeSubStyle : activeStyle) : undefined,
    };
    const Icon = item.icon;
    const label = item.i18nKey ? t(item.i18nKey) : item.label;
    if (isSub) return <NavSubItem key={item.key} {...commonProps}>{label}</NavSubItem>;
    return <NavItem key={item.key} icon={Icon ? <Icon /> : undefined} {...commonProps}>{label}</NavItem>;
  };

  return (
    <NavDrawer open type="inline" style={{ minWidth: 220, height: '100vh', borderRight: '1px solid #eee', background: '#fff' }}>
      <NavDrawerHeader>
        <span style={{ fontWeight: 700, fontSize: 18, padding: '16px 0 8px 24px', display: 'block' }}>运维管理控制台</span>
      </NavDrawerHeader>
      <NavDrawerBody>
        {mainItems.map(item => {
          if (item.children) {
            const anyChildActive = item.children.some(c => c.path && location.pathname === c.path);
            const open = openCategories.has(item.key);
            return (
              <NavCategory key={item.key} value={item.key}>
                <NavCategoryItem
                  // Pass an instantiated React element for the icon slot (fixes invalid attribute $$typeof warning)
                  icon={item.icon ? React.createElement(item.icon) : undefined}
                  style={anyChildActive ? activeCategoryStyle : undefined}
                  onClick={() => toggleCategory(item.key)}
                  aria-expanded={open}
                  ref={el => { if (el) categoryRefs.current[item.key] = el; }}
                >
                  {item.i18nKey ? t(item.i18nKey) : item.label}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>{open ? '▾' : '▸'}</span>
                </NavCategoryItem>
                {open && (
                  <NavSubItemGroup>
                    {item.children.map(child => renderLeaf(child, true))}
                  </NavSubItemGroup>
                )}
              </NavCategory>
            );
          }
          return renderLeaf(item, false);
        })}
  {otherItems.length > 0 && <><NavDivider /><NavSectionHeader>{t('menu.section.other','其他')}</NavSectionHeader>{otherItems.map(i => renderLeaf(i, false))}</>}
        <div style={{ padding: '12px 16px', fontSize: 12, opacity: 0.7 }}>当前角色: {role}</div>
      </NavDrawerBody>
    </NavDrawer>
  );
};

const activeStyle = { background: 'var(--colorBrandBackground2, #F0F6FF)', fontWeight: 600 };
const activeSubStyle = { background: 'var(--colorBrandBackground2, #F0F6FF)', fontWeight: 600 };
const activeCategoryStyle = { background: 'var(--colorBrandBackground2, #F0F6FF)', fontWeight: 600 };

export default Sidebar;
