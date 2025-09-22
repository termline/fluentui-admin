import { describe, it, expect } from 'vitest';
import { getEffectivePermissions, PERMISSIONS } from '../config/permissions';

describe('permissions override', () => {
  it('returns role permissions when no custom', () => {
    const user = { role: 'viewer' };
    const set = getEffectivePermissions(user);
    expect(set.has(PERMISSIONS.DASHBOARD_VIEW)).toBe(true);
    expect(set.has(PERMISSIONS.USERS_READ)).toBe(false);
  });

  it('merges custom permissions by default', () => {
    const user = { role: 'viewer', permissions: [PERMISSIONS.USERS_READ] };
    const set = getEffectivePermissions(user);
    expect(set.has(PERMISSIONS.DASHBOARD_VIEW)).toBe(true); // from role
    expect(set.has(PERMISSIONS.USERS_READ)).toBe(true); // custom
  });

  it('override mode replaces when provided', () => {
    const user = { role: 'viewer', permissions: [PERMISSIONS.USERS_READ] };
    const set = getEffectivePermissions(user, { override: true });
    expect(set.has(PERMISSIONS.DASHBOARD_VIEW)).toBe(false); // removed
    expect(set.has(PERMISSIONS.USERS_READ)).toBe(true);
  });

  it('wildcard custom permissions wins', () => {
    const user = { role: 'viewer', permissions: ['*'] };
    const set = getEffectivePermissions(user);
    expect(set.has('*')).toBe(true);
  });
});
