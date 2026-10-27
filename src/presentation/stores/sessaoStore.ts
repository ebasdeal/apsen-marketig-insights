import type { Sessao, UsuarioSessao } from '@domain/auth/Sessao';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SESSAO_STORAGE_KEY = 'demand-intelligence:sessao';

interface SessaoState {
  sessao: Sessao | null;
  hidratado: boolean;
  saindo: boolean;
  iniciar: (sessao: Sessao) => void;
  atualizarUsuario: (usuario: UsuarioSessao) => void;
  encerrar: () => void;
  cancelarSaida: () => void;
  expirar: () => void;
}

export const INITIAL_SESSAO_STATE: Pick<SessaoState, 'sessao' | 'hidratado' | 'saindo'> = {
  sessao: null,
  hidratado: false,
  saindo: false,
};

export const useSessaoStore = create<SessaoState>()(
  persist(
    (set) => ({
      ...INITIAL_SESSAO_STATE,
      iniciar: (sessao) => set({ sessao, saindo: false }),
      atualizarUsuario: (usuario) =>
        set((state) => (state.sessao === null ? {} : { sessao: { ...state.sessao, usuario } })),
      encerrar: () => set({ sessao: null, saindo: true }),
      cancelarSaida: () => set({ saindo: false }),
      expirar: () => set((state) => (state.sessao === null ? {} : { sessao: null })),
    }),
    {
      name: SESSAO_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ sessao: state.sessao }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useSessaoStore.setState({ hidratado: true });
      },
    },
  ),
);

export function rehydrateSessao(): void {
  void useSessaoStore.persist.rehydrate();
}

export function tokenAtual(): string | undefined {
  return useSessaoStore.getState().sessao?.token;
}

export function expirarSessao(): void {
  useSessaoStore.getState().expirar();
}
