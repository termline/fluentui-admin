import { describe, it, expect } from 'vitest';
import { formatDate, validateEmail } from './index.js';

describe('utils', () => {
  it('validateEmail returns true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  it('validateEmail returns false for invalid email', () => {
    expect(validateEmail('nope')).toBe(false);
  });
  it('formatDate returns a localized string', () => {
    const out = formatDate('2024-01-01T00:00:00Z');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});
