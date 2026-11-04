import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND_ACCENT, BRAND_BACKGROUND } from './brand';

const scss = readFileSync(path.join(process.cwd(), 'src/styles/_colors.scss'), 'utf8');
const read = (name: string) => scss.match(new RegExp(`\\$${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

describe('brand colours', () => {
  it('match the SCSS palette', () => {
    expect(BRAND_BACKGROUND).toBe(read('brand-background'));
    expect(BRAND_ACCENT).toBe(read('brand-accent'));
    expect(read('brand-background')).toBe(read('ink-950'));
    expect(read('brand-accent')).toBe(read('amber-400'));
  });
});
