import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { Outlet } from 'react-router-dom';

const layoutStyle = { display: 'flex', flexDirection: 'column', height: '100vh' };
const contentRowStyle = { display: 'flex', flex: 1, minHeight: 0 };
const mainStyle = { flex: 1, padding: '24px', background: '#f5f6fa', overflow: 'auto' };

const AdminLayout = () => (
  <div style={layoutStyle}>
    <Header />
    <div style={contentRowStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

export default AdminLayout;