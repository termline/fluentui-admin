// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
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

  it('category toggle expands and persists (custom accordion)', () => {
    localStorage.removeItem('sidebar.openCategories');
    renderWithRole('admin', '/');
    const categoryBtn = screen.getByRole('button', { name: /主机管理/ });
    // 未展开时 hidden 子项不可见
    expect(screen.queryByText('主机列表')).not.toBeInTheDocument();
    fireEvent.click(categoryBtn);
    expect(screen.getByText('主机列表')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('sidebar.openCategories'));
    expect(stored).toContain('hostCategory');
  });

  it('persists category state across renders (storage round-trip)', () => {
    localStorage.removeItem('sidebar.openCategories');
    renderWithRole('admin', '/');
    const categoryBtn = screen.getByRole('button', { name: /主机管理/ });
    act(() => { fireEvent.click(categoryBtn); });
    const stored = JSON.parse(localStorage.getItem('sidebar.openCategories'));
    expect(stored).toContain('hostCategory');
    // 卸载后重新挂载
    cleanup();
    renderWithRole('admin', '/');
    // 重新渲染后可能出现一个实例（不应重复两个）；使用 queryAll 兼容未来结构
    const items = screen.queryAllByText('主机列表');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  // 现已切换为自定义受控手风琴，可直接断言子项可见性。
});
