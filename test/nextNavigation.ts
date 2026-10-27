export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const navigationState: {
  pathname: string;
  params: Record<string, string>;
  search: string;
} = {
  pathname: '/',
  params: {},
  search: '',
};

export function resetNavigationMock(): void {
  Object.values(routerMock).forEach((fn) => fn.mockReset());
  navigationState.pathname = '/';
  navigationState.params = {};
  navigationState.search = '';
}
