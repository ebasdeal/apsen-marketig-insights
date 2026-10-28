'use client';

import { useSessaoStore } from '../stores/sessaoStore';

// Mesma regra do aviso "somente visualização": usuário inativo não escreve (a API também recusa).
export function usePodeEscrever(): boolean {
  return useSessaoStore((state) => state.sessao?.usuario.ativo !== false);
}
