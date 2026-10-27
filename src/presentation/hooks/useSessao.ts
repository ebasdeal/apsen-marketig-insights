'use client';

import type { UsuarioSessao } from '@domain/auth/Sessao';
import type { NivelAcesso } from '@domain/perfis/Perfil';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useUseCases } from '../providers/UseCasesContext';
import { useSessaoStore } from '../stores/sessaoStore';
import { usePerfilAtual, type PerfilAtual } from './usePerfilAtual';

export interface SessaoAtual extends PerfilAtual {
  usuario: UsuarioSessao | undefined;
  nivel: NivelAcesso | undefined;
  concluirLogin: (code: string | null) => Promise<void>;
  sair: () => Promise<void>;
}

export function useSessao(): SessaoAtual {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const usuario = useSessaoStore((state) => state.sessao?.usuario);
  const iniciar = useSessaoStore((state) => state.iniciar);
  const encerrar = useSessaoStore((state) => state.encerrar);
  const cancelarSaida = useSessaoStore((state) => state.cancelarSaida);
  const perfilAtual = usePerfilAtual();

  const concluirLogin = useCallback(
    async (code: string | null) => {
      const sessao = await useCases.auth.concluirLogin.execute(code);
      queryClient.clear();
      iniciar(sessao);
    },
    [useCases, queryClient, iniciar],
  );

  const sair = useCallback(async () => {
    await useCases.auth.sair.execute().catch(() => undefined);
    encerrar();
    queryClient.clear();
    try {
      useCases.auth.encerrarNoProvedor.execute();
    } catch (error) {
      cancelarSaida();
      throw error;
    }
  }, [useCases, queryClient, encerrar, cancelarSaida]);

  return { ...perfilAtual, usuario, nivel: perfilAtual.perfil?.nivel, concluirLogin, sair };
}
