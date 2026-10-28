'use client';

import { buttonClasses } from '@presentation/components/ui';
import { useThemeStore, type ThemePreference } from '../../stores/themeStore';

const LABELS: Record<ThemePreference, string> = {
  system: 'Tema: sistema',
  light: 'Tema: claro',
  dark: 'Tema: escuro',
};

export function ThemeToggle() {
  const preference = useThemeStore((state) => state.preference);
  const cycle = useThemeStore((state) => state.cycle);
  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={cycle}
      className={buttonClasses('ghost', 'sm', 'min-w-[112px] justify-center')}
    >
      {LABELS[preference]}
    </button>
  );
}
