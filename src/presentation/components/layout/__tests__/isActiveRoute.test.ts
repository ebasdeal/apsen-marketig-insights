import { isActiveRoute } from '../isActiveRoute';

describe('isActiveRoute', () => {
  it.each([
    ['/', '/', true],
    ['/campaigns', '/', false],
    ['/campaigns', '/campaigns', true],
    ['/campaigns/abc', '/campaigns', true],
    ['/campaignsx', '/campaigns', false],
    ['/', '/campaigns', false],
  ])('pathname %s com href %s → %s', (pathname, href, expected) => {
    expect(isActiveRoute(pathname, href)).toBe(expected);
  });
});
