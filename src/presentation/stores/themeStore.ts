import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'marketing-insights:theme';

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  cycle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
      cycle: () => set((state) => ({ preference: NEXT[state.preference] })),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ preference: state.preference }),
      skipHydration: true,
    },
  ),
);

export function rehydrateThemePreference(): void {
  void useThemeStore.persist.rehydrate();
}
