import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '1200px'
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
    marginBottom: tokens.spacingVerticalS
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    margin: 0,
    marginBottom: tokens.spacingVerticalM
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  }
});

/**
 * 统一的页面容器组件
 * @param {string} title - 页面标题
 * @param {string} subtitle - 页面副标题（可选）
 * @param {React.ReactNode} children - 页面内容
 * @param {string} className - 额外的CSS类名
 */
const PageContainer = ({ title, subtitle, children, className }) => {
  const styles = useStyles();
  
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;