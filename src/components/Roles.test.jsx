// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import Router from '../router';
import useGlobalStore from '../store';

// Minimal roles permission simulation: ensure user has ROLES_MANAGE (reuse admin default)

describe('Roles page routing', () => {
  beforeEach(() => {
    useGlobalStore.setState({ user: { name: 'Tester', role: 'admin' } });
  });

  it('renders 角色管理 heading when navigating to /roles', async () => {
    window.history.pushState({}, '', '/roles');
    render(<Router />);
  // Use role=heading to target the page h2, avoiding duplicates from sidebar/nav
  const heading = await screen.findByRole('heading', { name: '角色管理' });
    expect(heading).toBeInTheDocument();
  });
});
