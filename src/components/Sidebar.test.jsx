// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import useGlobalStore from '../store';

function renderWithRole(role = 'admin', path = '/') {
  useGlobalStore.setState({ user: { name: 'Tester', role } });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar (permissions)', () => {
  beforeEach(() => {
    useGlobalStore.setState({ user: null });
  });

  it('renders admin only categories for admin', () => {
    renderWithRole('admin');
    expect(screen.getByText('用户权限')).toBeInTheDocument();
    expect(screen.getByText('系统设置')).toBeInTheDocument();
  });

  it('auditor cannot see 用户权限 / 系统设置', () => {
    renderWithRole('auditor');
    expect(screen.queryByText('用户权限')).not.toBeInTheDocument();
    expect(screen.queryByText('系统设置')).not.toBeInTheDocument();
  });

  it('operator sees 主机管理 but not 用户权限', () => {
    renderWithRole('operator');
    expect(screen.getByText('主机管理')).toBeInTheDocument();
    expect(screen.queryByText('用户权限')).not.toBeInTheDocument();
  });

  it('highlights dashboard when path=/', () => {
    renderWithRole('admin', '/');
    const dash = screen.getByText('仪表盘');
    expect(dash.getAttribute('aria-current')).toBe('page');
  });

  it('category toggle expands and persists', () => {
    // 清理本地存储
    localStorage.removeItem('sidebar.openCategories');
    renderWithRole('admin', '/');
    const category = screen.getByText('主机管理');
    // 初始未展开（子项“主机列表”不可见）
    expect(screen.queryByText('主机列表')).not.toBeInTheDocument();
    // 点击展开
    fireEvent.click(category);
    expect(screen.getByText('主机列表')).toBeInTheDocument();
    // 应写入 localStorage
    const stored = JSON.parse(localStorage.getItem('sidebar.openCategories'));
    expect(stored).toContain('hostCategory');
  });

  it('restores expanded category from localStorage', async () => {
    localStorage.setItem('sidebar.openCategories', JSON.stringify(['hostCategory']));
    renderWithRole('admin', '/');
    // 应自动展开（等待 DOM commit）
    const child = await screen.findByText('主机列表');
    expect(child).toBeInTheDocument();
  });

  // 子菜单渲染依赖内部 NavCategory 展开机制 (当前实现不自动展开)，此处暂不测试子项可见性，避免对 Fluent UI 内部行为耦合。
});
