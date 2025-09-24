import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeStyles, tokens } from '@fluentui/react-components';
import { findMenuByPath, flattenMenu, menuTree } from '../config/menuConfig';
import { t } from '../i18n';
import { Breadcrumb, BreadcrumbItem, BreadcrumbDivider, BreadcrumbButton } from '@fluentui/react-components';

const useStyles = makeStyles({
  breadcrumb: {
    marginBottom: tokens.spacingVerticalM
  },
  currentItem: {
    fontWeight: tokens.fontWeightSemibold
  }
});

// 生成路径层级：使用匹配的菜单项 parentKeys -> 再映射到扁平表中的对象
export default function Breadcrumbs() {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const flat = React.useMemo(() => flattenMenu(menuTree), []);
  const current = findMenuByPath(location.pathname);

  if (!current) return null; // 若路径不在菜单中，不展示面包屑

  const chainKeys = [...(current.parentKeys || []), current.key];
  const chainItems = chainKeys
    .map(k => flat.find(i => i.key === k))
    .filter(Boolean);

  // 首页判断：若第一个不是 dashboard 且存在 dashboard，手动前置
  const hasDashboard = flat.find(i => i.key === 'dashboard');
  if (hasDashboard && chainItems[0]?.key !== 'dashboard') {
    chainItems.unshift(hasDashboard);
  }

  return (
    <Breadcrumb aria-label="breadcrumb" size="small" className={styles.breadcrumb}>
      {chainItems.map((item, idx) => {
        const isLast = idx === chainItems.length - 1;
        return (
          <React.Fragment key={item.key}>
            <BreadcrumbItem>
              {isLast || !item.path ? (
                <span className={isLast ? styles.currentItem : undefined}>
                  {item.i18nKey ? t(item.i18nKey) : item.label}
                </span>
              ) : (
                <BreadcrumbButton onClick={() => navigate(item.path)}>
                  {item.i18nKey ? t(item.i18nKey) : item.label}
                </BreadcrumbButton>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbDivider />}
          </React.Fragment>
        );
      })}
    </Breadcrumb>
  );
}
