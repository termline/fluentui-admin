import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { Outlet } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: tokens.colorNeutralBackground2
  },
  skipLink: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    transform: 'translateY(-120%)',
    transition: 'transform 0.2s',
    ':focus': {
      transform: 'translateY(0)'
    }
  },
  row: {
    display: 'flex',
    flex: 1,
    minHeight: 0
  },
  nav: {
    background: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0
  },
  content: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.colorNeutralBackground1,
    overflow: 'hidden',
    minHeight: 0
  },
  main: {
    flex: 1,
    padding: tokens.spacingHorizontalL,
    overflow: 'auto',
    minHeight: 0
  },
  breadcrumbsContainer: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL} 0`,
    background: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
  }
});

const AdminLayout = () => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <a href="#main-content" className={styles.skipLink}>跳到主要内容</a>
      <Header />
      <div className={styles.row}>
        <div className={styles.nav}>
          <Sidebar />
        </div>
        <div className={styles.content}>
          <div className={styles.breadcrumbsContainer}>
            <Breadcrumbs />
          </div>
          <main id="main-content" className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;