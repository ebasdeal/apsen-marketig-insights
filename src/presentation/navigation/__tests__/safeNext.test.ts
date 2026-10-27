import { safeNext } from '../safeNext';

describe('safeNext', () => {
  it.each([
    [null, '/'],
    [undefined, '/'],
    ['', '/'],
    ['/drivers', '/drivers'],
    ['/drivers?q=x', '/drivers?q=x'],
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
    ['https://evil.com', '/'],
    ['/auth/callback?code=x', '/'],
  ])('%p → %p', (next, esperado) => {
    expect(safeNext(next)).toBe(esperado);
  });
});
