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
    background: tokens.colorNeutralBackground1
  },
  skipLink: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '8px 16px',
    borderRadius: 4,
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
    minWidth: '260px',
    background: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`
  },
  content: {
    flex: '1',
    padding: tokens.spacingHorizontalL,
    display: 'grid',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    background: tokens.colorNeutralBackground2,
    overflow: 'auto',
    minHeight: 0,
    boxShadow: `0 0 0 1px ${tokens.colorNeutralStroke2}`,
    borderRadius: 0
  },
  field: {
    display: 'flex',
    marginTop: tokens.spacingVerticalS,
    marginLeft: tokens.spacingHorizontalS,
    flexDirection: 'column',
    gridRowGap: tokens.spacingVerticalS
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
        <main id="main-content" className={styles.content}>
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;