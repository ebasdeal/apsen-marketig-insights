'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export const MOBILE_NAV_QUERY = '(width < 800px)';

interface NavContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  closeOnMobile: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

function subscribeToViewport(onChange: () => void): () => void {
  const media = window.matchMedia(MOBILE_NAV_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_NAV_QUERY).matches;
}

function isServerMobile(): boolean {
  return false;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const mobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, isServerMobile);
  const [choice, setChoice] = useState<boolean | null>(null);
  const open = choice ?? !mobile;

  const toggle = useCallback(() => setChoice(!open), [open]);
  const close = useCallback(() => setChoice(false), []);
  const closeOnMobile = useCallback(() => {
    if (mobile) {
      setChoice(false);
    }
  }, [mobile]);

  const value = useMemo(
    () => ({ open, toggle, close, closeOnMobile }),
    [open, toggle, close, closeOnMobile],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const value = useContext(NavContext);
  if (!value) {
    throw new Error('useNav precisa estar dentro de NavProvider');
  }
  return value;
}
