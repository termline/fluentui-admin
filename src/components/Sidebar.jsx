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
    width: 280,
    '--sidebar-expanded-width': '280px',
    '--sidebar-collapsed-width': '64px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 160ms ease'
  },
  rootCollapsed: {
    width: 'var(--sidebar-collapsed-width)'
  },
  title: {
    fontWeight: 500,
    fontSize: '14px',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalXS}`,
    lineHeight: 1.2
  },
  titleCollapsed: {
    fontSize: 0,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS} ${tokens.spacingVerticalXXS}`
  },
  toggleBar: {
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  toggleBtn: {
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    borderRadius: 4,
    width: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground1,
    ':hover': { background: tokens.colorNeutralBackground2 },
    ':active': { background: tokens.colorNeutralBackground3 },
    ':focus-visible': { outline: `2px solid ${tokens.colorStrokeFocus2}`, outlineOffset: 2 }
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalXS} ${tokens.spacingVerticalS}`
  },
  categoryButton: {
    backgroundColor: 'transparent',
    border: 'none',
    margin: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: '13px',
    lineHeight: 1.3,
    padding: '6px 8px',
    borderRadius: 6,
    textAlign: 'left',
    color: tokens.colorNeutralForeground1,
    position: 'relative',
    ':hover': {
      background: tokens.colorNeutralBackground2
    },
    ':active': {
      background: tokens.colorNeutralBackground3
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorStrokeFocus2}`,
      outlineOffset: 2
    }
  },
  categoryIcon: {
    display: 'inline-flex',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    marginRight: 8,
    transition: 'margin 160ms ease',
    // 保证内部 svg 尺寸一致，不因字体继承或 line-height 波动
    '& svg': {
      width: 20,
      height: 20,
      minWidth: 20,
      minHeight: 20,
      flexShrink: 0
    }
  },
  categoryIconCollapsed: {
    marginRight: 0
  },
  chevron: {
    display: 'inline-flex',
    fontSize: 16,
    opacity: 0.6
  },
  chevronHidden: {
    display: 'none'
  },
  label: {
    flex: 1,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    transition: 'opacity 120ms ease'
  },
  labelCollapsed: {
    opacity: 0,
    pointerEvents: 'none'
  },
  role: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    fontSize: 11,
    opacity: 0.65,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`
  },
  roleCollapsed: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXXS}`,
    fontSize: 10,
    textAlign: 'center'
  },
  collapsedTooltip: {
    position: 'relative'
  }
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
      try { localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0'); } catch {}
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
    } catch (e) { /* ignore */ }
    const activeParent = filtered.find(i => i.children && i.children.some(c => c.path === location.pathname));
    return activeParent ? new Set([activeParent.key]) : new Set();
  });

  const persist = useCallback((setVal) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(setVal))); } catch(e){ /* ignore */ }
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
    const commonProps = {
      onClick: () => item.path && navigate(item.path),
      'aria-current': active ? 'page' : undefined,
      icon: IconComp ? (
        <span className={styles.categoryIcon + (collapsed ? ' ' + styles.categoryIconCollapsed : '')}>
          <IconComp />
        </span>
      ) : undefined,
    };
    const textSpan = (
      <span
        className={styles.label + (collapsed ? ' ' + styles.labelCollapsed : '')}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </span>
    );
    return isChild ? (
      <NavSubItem key={item.key} {...commonProps}>{textSpan}</NavSubItem>
    ) : (
      <NavItem key={item.key} {...commonProps}>{textSpan}</NavItem>
    );
  };

  return (
    <div className={styles.root + (collapsed ? ' ' + styles.rootCollapsed : '')}>
      <div className={styles.toggleBar}>
        <button aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'} onClick={toggleCollapsed} className={styles.toggleBtn}>
          {collapsed ? <PanelLeftExpandRegular /> : <PanelLeftContractRegular />}
        </button>
      </div>
      <div className={styles.title + (collapsed ? ' ' + styles.titleCollapsed : '')}>控制台</div>
      <Nav aria-label="主导航" className={styles.nav}>
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
              <NavSectionHeader>
                <button
                  type="button"
                  onClick={() => toggleCategory(group.key)}
                  aria-expanded={open}
                  aria-controls={`cat-${group.key}`}
                  aria-current={anyChildActive ? 'true' : undefined}
                  className={styles.categoryButton}
                >
                  {GroupIcon && (
                    <span className={styles.categoryIcon + (collapsed ? ' ' + styles.categoryIconCollapsed : '')}>
                      <GroupIcon />
                    </span>
                  )}
                  <span className={styles.label + (collapsed ? ' ' + styles.labelCollapsed : '')}>{label}</span>
                  <span aria-hidden="true" className={styles.chevron + (collapsed ? ' ' + styles.chevronHidden : '')}>
                    {open ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
                  </span>
                </button>
              </NavSectionHeader>
              {!collapsed && (
                <div id={`cat-${group.key}`} hidden={!open}>
                  {open && group.children.map(child => renderItem(child, true))}
                </div>
              )}
            </React.Fragment>
          );
        })}
        {extraItems.length > 0 && <>
          <NavDivider />
          <NavSectionHeader>{t('menu.section.other','其他')}</NavSectionHeader>
          {extraItems.map(item => renderItem(item, false))}
        </>}
      </Nav>
      <div className={styles.role + (collapsed ? ' ' + styles.roleCollapsed : '')}>当前角色: {role}</div>
    </div>
  );
};

export default Sidebar;
