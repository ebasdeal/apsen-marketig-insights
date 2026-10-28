import { describe, expect, it } from 'vitest';
import robots from '../robots';

describe('robots', () => {
  it('publica um robots.txt válido', () => {
    expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
  });
});
