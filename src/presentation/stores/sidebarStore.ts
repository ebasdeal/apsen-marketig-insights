import type { ModuloId } from '@domain/perfis/acesso';
import { create } from 'zustand';
import type { AccordionChoice } from '../navigation/resolveOpenModule';

interface SidebarState {
  openChoice: boolean | null;
  accordion: AccordionChoice | null;
  setOpenChoice: (open: boolean | null) => void;
  setAccordion: (module: ModuloId | null, atPath: string) => void;
}

export const INITIAL_SIDEBAR_STATE: Pick<SidebarState, 'openChoice' | 'accordion'> = {
  openChoice: null,
  accordion: null,
};

export const useSidebarStore = create<SidebarState>()((set) => ({
  ...INITIAL_SIDEBAR_STATE,
  setOpenChoice: (openChoice) => set({ openChoice }),
  setAccordion: (module, atPath) => set({ accordion: { module, atPath } }),
}));
