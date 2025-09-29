import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { Outlet } from 'react-router-dom';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100%',
  },
  sidebar: {
    //width: '240px',
    backgroundColor: '#f3f2f1',
    boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
});

export const AdminLayout = ({ children }) => {
  const styles = useStyles();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>
      <main className={styles.main}>
        <Header />

        <div className={styles.body}>
          <div className='breadcrumbs'>
            <Breadcrumbs />
          </div>
          <div><Outlet /></div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AdminLayout;