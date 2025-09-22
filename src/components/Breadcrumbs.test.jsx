import React from 'react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from './Breadcrumbs';
import { menuTree } from '../config/menuConfig';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<Breadcrumbs />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Breadcrumbs', () => {
  it('renders dashboard only on root', () => {
    renderAt('/');
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
  });

  it('renders full chain for nested host child', () => {
    renderAt('/hosts/add');
    // Expect 仪表盘 + 主机管理 + 添加主机 (last not clickable so bold span)
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('主机管理')).toBeInTheDocument();
    expect(screen.getByText('添加主机')).toBeInTheDocument();
  });

  it('renders logs chain', () => {
    renderAt('/logs/rules');
    expect(screen.getByText('日志审计')).toBeInTheDocument();
    expect(screen.getByText('审计规则')).toBeInTheDocument();
  });

  it('hides breadcrumb when path not in menu', () => {
    renderAt('/__unknown__');
    expect(screen.queryByText('仪表盘')).not.toBeInTheDocument();
  });
});
