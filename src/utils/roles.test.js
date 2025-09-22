import { describe, it, expect } from 'vitest';
import { normalizeRole, roleLabel } from './roles';
import { mockLogin } from '../api';

describe('roles utilities', () => {
  it('normalizes Chinese role names to codes', () => {
    expect(normalizeRole('管理员')).toBe('admin');
    expect(normalizeRole('运维')).toBe('operator');
    expect(normalizeRole('审计')).toBe('auditor');
    expect(normalizeRole('只读')).toBe('viewer');
  });
  it('roleLabel maps codes to Chinese', () => {
    expect(roleLabel('admin')).toBe('管理员');
    expect(roleLabel('auditor')).toBe('审计');
  });
  it('mockLogin returns chosen role code', async () => {
    const res = await mockLogin('tester','operator');
    expect(res.data.role).toBe('operator');
  });
});
