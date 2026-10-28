'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useSidebarStore } from '../../stores/sidebarStore';

export const MOBILE_NAV_QUERY = '(width < 1024px)';

export const SIDEBAR_ID = 'app-sidebar';

export const BURGER_ID = 'app-burger';

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

function focusDrawerTarget(open: boolean): void {
  const target = open
    ? document.querySelector<HTMLElement>(`#${SIDEBAR_ID} a`)
    : document.getElementById(BURGER_ID);
  target?.focus();
}

function useDrawerFocus(open: boolean, mobile: boolean, close: () => void): void {
  const previous = useRef(open);
  useEffect(() => {
    if (mobile && previous.current !== open) {
      focusDrawerTarget(open);
    }
    previous.current = open;
  }, [open, mobile]);

  useEffect(() => {
    if (!mobile || !open) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, mobile, close]);
}

export function NavProvider({ children }: { children: ReactNode }) {
  const mobile = useSyncExternalStore(subscribeToViewport, isMobileViewport, isServerMobile);
  const choice = useSidebarStore((state) => state.openChoice);
  const setChoice = useSidebarStore((state) => state.setOpenChoice);
  const open = choice ?? !mobile;

  const toggle = useCallback(() => setChoice(!open), [open, setChoice]);
  const close = useCallback(() => setChoice(false), [setChoice]);
  const closeOnMobile = useCallback(() => {
    if (mobile) {
      setChoice(false);
    }
  }, [mobile, setChoice]);

  useDrawerFocus(open, mobile, close);

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
