import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav, NavItem, NavSubItem, NavSectionHeader, NavDivider } from '@fluentui/react-components';
import { ChevronDown16Regular, ChevronRight16Regular } from '@fluentui/react-icons';
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

const Sidebar = () => {
  const user = useGlobalStore(s => s.user);
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
      icon: !isChild && IconComp ? <IconComp /> : undefined,
    };
    const textSpan = (
      <span aria-current={active ? 'page' : undefined}>{label}</span>
    );

    if (isChild) {
      return (
        <NavSubItem key={item.key} {...commonProps}>
          {textSpan}
        </NavSubItem>
      );
    } else {
      return (
        <NavItem key={item.key} {...commonProps}>
          {textSpan}
        </NavItem>
      );
    }
  };

  return (
    <div>
      <Nav aria-label="主导航">
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
                >
                  {GroupIcon && <GroupIcon />}
                  <span style={{ marginLeft: GroupIcon ? 8 : 0 }}>{label}</span>
                  <span aria-hidden="true" style={{ marginLeft: 'auto' }}>
                    {open ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
                  </span>
                </button>
              </NavSectionHeader>
              <div id={`cat-${group.key}`} hidden={!open}>
                {open && group.children.map(child => renderItem(child, true))}
              </div>
            </React.Fragment>
          );
        })}
        {extraItems.length > 0 && <>
          <NavDivider />
          <NavSectionHeader>{t('menu.section.other','其他')}</NavSectionHeader>
          {extraItems.map(item => renderItem(item, false))}
        </>}
      </Nav>
    </div>
  );
};

export default Sidebar;
