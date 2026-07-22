import { describe, expect, it } from 'vitest';
import { money } from './api';

describe('money formatter', () => {
  it('formats menu prices as Sri Lankan rupees', () => {
    const value = money(4900);
    expect(value).toContain('4,900');
    expect(value).toMatch(/LKR|Rs/);
  });
});

