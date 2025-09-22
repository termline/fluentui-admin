// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import useGlobalStore from '../store';

function renderWithRole(role = 'admin', path = '/') {
  useGlobalStore.setState({ user: { name: 'Tester', role } });
  return render(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Sidebar)));
}

describe('Sidebar', () => {
  beforeEach(() => {
    useGlobalStore.setState({ user: null });
  });

  it('shows admin categories for admin', () => {
    renderWithRole('admin');
    expect(screen.getByText('用户权限')).toBeInTheDocument();
    expect(screen.getByText('系统设置')).toBeInTheDocument();
  });

  it('hides admin categories for auditor', () => {
    renderWithRole('auditor');
    expect(screen.queryByText('用户权限')).not.toBeInTheDocument();
    expect(screen.queryByText('系统设置')).not.toBeInTheDocument();
  });

  it('highlights active leaf based on path', () => {
    renderWithRole('admin', '/users');
    const activeLeaf = screen.getByText('用户管理');
    expect(activeLeaf.getAttribute('aria-current')).toBe('page');
  });

  it('click sets active (simulated by rerender on new path)', () => {
    const { rerender } = renderWithRole('admin', '/');
    const target = screen.getByText('用户管理');
    fireEvent.click(target);
    rerender(React.createElement(MemoryRouter, { initialEntries: ['/users'] }, React.createElement(Sidebar)));
    expect(screen.getByText('用户管理').getAttribute('aria-current')).toBe('page');
  });
});
