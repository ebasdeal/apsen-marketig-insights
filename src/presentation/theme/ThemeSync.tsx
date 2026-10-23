'use client';

import { useEffect } from 'react';
import { rehydrateThemePreference, useThemeStore } from '../stores/themeStore';
import { applyTheme, DARK_MEDIA_QUERY, resolveTheme } from './resolveTheme';

export function ThemeSync() {
  const preference = useThemeStore((state) => state.preference);
  useEffect(rehydrateThemePreference, []);
  useEffect(() => {
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const sync = () =>
      applyTheme(document.documentElement, resolveTheme(preference, media.matches));
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [preference]);
  return null;
}
