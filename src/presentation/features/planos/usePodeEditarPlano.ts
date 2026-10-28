'use client';

import { podeAcessar } from '@domain/perfis/acesso';
import type { NivelAcesso } from '@domain/perfis/Perfil';
import { usePerfilAtual } from '@presentation/hooks/usePerfilAtual';

export const NIVEL_EDICAO_PLANO: NivelAcesso = 3;

export function usePodeEditarPlano(): boolean {
  const { perfil } = usePerfilAtual();
  return perfil !== undefined && podeAcessar(perfil.nivel, NIVEL_EDICAO_PLANO);
}
