import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav, NavItem, NavSubItem, NavSectionHeader, NavDivider, makeStyles, tokens } from '@fluentui/react-components';
import { ChevronDown16Regular, ChevronRight16Regular, PanelLeftContractRegular, PanelLeftExpandRegular } from '@fluentui/react-icons';
import useGlobalStore from '../store';
import { menuTree } from '../config/menuConfig';
import { getEffectivePermissions, hasPermission } from '../config/permissions';
import { t } from '../i18n';

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

const COLLAPSE_STORAGE_KEY = 'sidebar.collapsed';

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
    height: "600px",
  },
  nav: {
    minWidth: "260px",
  },
  content: {
    flex: "1",
    padding: "16px",
    display: "grid",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  field: {
    display: "flex",
    marginTop: "4px",
    marginLeft: "8px",
    flexDirection: "column",
    gridRowGap: tokens.spacingVerticalS,
  },
});

const Sidebar = () => {
  const styles = useStyles();
  const user = useGlobalStore(s => s.user);
  const role = user?.role || 'viewer';
  // Sidebar collapsed state persistence
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      return raw === '1';
    } catch { return false; }
  });
  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0'); } catch { /* ignore persistence error */ }
      return next;
    });
  };
  const permissionsSet = getEffectivePermissions(user);
  const navigate = useNavigate();
  const location = useLocation();

  const filtered = filterMenu(menuTree, permissionsSet);

  // Collapsible category persistence (kept from previous custom implementation)
  const STORAGE_KEY = 'sidebar.openCategories';
  const [openCategories, setOpenCategories] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    const activeParent = filtered.find(i => i.children && i.children.some(c => c.path === location.pathname));
    return activeParent ? new Set([activeParent.key]) : new Set();
  });

  const persist = useCallback((setVal) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(setVal))); } catch { /* ignore */ }
  }, []);

  const toggleCategory = (key) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      persist(next);
      return next;
    });
  };

  const mainGroups = [];
  const extraItems = [];
  filtered.forEach(item => {
    if (item.section === 'extra') {
      if (item.children) {
        item.children.forEach(c => extraItems.push(c));
      } else extraItems.push(item);
    } else {
      mainGroups.push(item);
    }
  });

  const ICON_SIZE = 20; // unified icon size

  const renderItem = (item, isChild = false) => {
    const active = item.path && location.pathname === item.path;
    const label = item.i18nKey ? t(item.i18nKey) : item.label;
    let IconComp = null;
    if (item.icon) {
      if (item.icon.filled || item.icon.regular) {
        IconComp = active ? item.icon.filled : (item.icon.regular || item.icon.filled);
      } else {
        IconComp = item.icon;
      }
    }

    // 在折叠状态下，使用统一的自定义按钮
    if (collapsed) {
      return (
        <button
          key={item.key}
          onClick={() => item.path && navigate(item.path)}
          aria-current={active ? 'page' : undefined}
          aria-label={label}
          className={styles.collapsedMenuItem + (active ? ' ' + styles.collapsedMenuItemActive : '')}
          title={label}
        >
          {IconComp && (
            <span className={styles.categoryIcon}>
              <IconComp />
            </span>
          )}
        </button>
      );
    }

    const commonProps = {
      onClick: () => item.path && navigate(item.path),
      'aria-current': active ? 'page' : undefined,
      icon: !isChild && IconComp ? (
        <span className={styles.categoryIcon}>
          <IconComp />
        </span>
      ) : undefined,
    };
    const textSpan = (
      <span
        className={styles.label}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </span>
    );
    
    if (isChild) {
      return (
        <NavSubItem key={item.key} {...commonProps} className="nav-sub-item">
          {textSpan}
        </NavSubItem>
      );
    } else {
      // 顶级叶子节点使用与分组按钮一致的自定义按钮样式，去掉默认 NavItem 竖条与背景
      return (
        <div key={item.key} className="nav-main-item">
          <button
            type="button"
            onClick={() => item.path && navigate(item.path)}
            aria-current={active ? 'page' : undefined}
            className={
              styles.categoryButton + (active ? ' ' + styles.leafButtonActive : '')
            }
          >
            {IconComp && (
              <span className={styles.categoryIcon}>
                <IconComp />
              </span>
            )}
            <span className={styles.label}>{label}</span>
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.root + (collapsed ? ' ' + styles.rootCollapsed : '')}>
      <div className={styles.toggleBar}>
        <button aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'} onClick={toggleCollapsed} className={styles.toggleBtn}>
          {collapsed ? <PanelLeftExpandRegular /> : <PanelLeftContractRegular />}
        </button>
      </div>
      <div className={styles.title + (collapsed ? ' ' + styles.titleCollapsed : '')}>控制台</div>
      <Nav 
        aria-label="主导航" 
        className={`${styles.nav} ${collapsed ? styles.navCollapsed : styles.navExpanded}`}
      >
        {mainGroups.map(group => {
          if (!group.children) return renderItem(group, false);
          const label = group.i18nKey ? t(group.i18nKey) : group.label;
          const open = openCategories.has(group.key);
          // Determine if any child in this group is active to decide icon variant
          const anyChildActive = group.children.some(c => c.path && c.path === location.pathname);
          let GroupIcon = null;
          if (group.icon) {
            if (group.icon.filled || group.icon.regular) {
              GroupIcon = anyChildActive ? group.icon.filled : (group.icon.regular || group.icon.filled);
            } else {
              GroupIcon = group.icon;
            }
          }
          return (
            <React.Fragment key={group.key}>
              <NavSectionHeader className={styles.groupHeader}>
                <button
                  type="button"
                  onClick={() => toggleCategory(group.key)}
                  aria-expanded={collapsed ? undefined : open}
                  aria-controls={collapsed ? undefined : `cat-${group.key}`}
                  aria-current={anyChildActive ? 'true' : undefined}
                  aria-label={collapsed ? label : undefined}
                  title={collapsed ? label : undefined}
                  className={collapsed ? 
                    styles.collapsedMenuItem + (anyChildActive ? ' ' + styles.collapsedMenuItemActive : '') :
                    styles.categoryButton
                  }
                >
                  {GroupIcon && (
                    <span className={styles.categoryIcon + (collapsed ? ' ' + styles.categoryIconCollapsed : '')}>
                      <GroupIcon />
                    </span>
                  )}
                  {!collapsed && (
                    <>
                      <span className={styles.label}>{label}</span>
                      <span aria-hidden="true" className={styles.chevron}>
                        {open ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
                      </span>
                    </>
                  )}
                </button>
              </NavSectionHeader>
              {!collapsed && (
                <div id={`cat-${group.key}`} hidden={!open} className={styles.subMenuContainer}>
                  {open && group.children.map(child => renderItem(child, true))}
                </div>
              )}
            </React.Fragment>
          );
        })}
        {extraItems.length > 0 && <>
          <NavDivider />
          <NavSectionHeader className={styles.groupHeader}>{t('menu.section.other','其他')}</NavSectionHeader>
          {extraItems.map(item => renderItem(item, false))}
        </>}
      </Nav>
      <div className={styles.role + (collapsed ? ' ' + styles.roleCollapsed : '')}>当前角色: {role}</div>
    </div>
  );
};

export default Sidebar;
