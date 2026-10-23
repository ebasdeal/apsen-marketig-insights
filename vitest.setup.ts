import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import {
  INITIAL_CAMPAIGN_FILTERS,
  useCampaignFiltersStore,
} from '@presentation/stores/campaignFiltersStore';
import { useThemeStore } from '@presentation/stores/themeStore';
import { navigationState, resetNavigationMock, routerMock } from './test/nextNavigation';

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => navigationState.pathname,
  useParams: () => navigationState.params,
  useSearchParams: () => new URLSearchParams(),
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
  useCampaignFiltersStore.setState(INITIAL_CAMPAIGN_FILTERS);
  useThemeStore.setState({ preference: 'system' });
});

afterEach(() => {
  cleanup();
});
