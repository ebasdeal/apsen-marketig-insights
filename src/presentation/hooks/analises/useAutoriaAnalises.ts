'use client';

import { useSessaoStore } from '../../stores/sessaoStore';

// PRG-ANL-01: a Área só enxerga as análises que criou; Planejador e Admin enxergam todas.
export function useAutoriaAnalises(): {
  usuarioId: string | undefined;
  escopo: string | undefined;
} {
  const usuario = useSessaoStore((state) => state.sessao?.usuario);
  return {
    usuarioId: usuario?.id,
    escopo: usuario?.perfil === 'area' ? usuario.id : undefined,
  };
}
