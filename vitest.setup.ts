import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { navigationState, resetNavigationMock, routerMock } from './test/nextNavigation';
import { resetStores } from './test/resetStores';

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => navigationState.pathname,
  useParams: () => navigationState.params,
  useSearchParams: () => new URLSearchParams(navigationState.search),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

function createMatchMedia(matches: boolean) {
  return (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
}

beforeEach(() => {
  window.matchMedia = createMatchMedia(false);
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  resetNavigationMock();
  resetStores();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});
