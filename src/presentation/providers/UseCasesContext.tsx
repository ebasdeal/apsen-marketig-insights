'use client';

import type {
  ConcluirLogin,
  EncerrarNoProvedor,
  IniciarLogin,
  ObterSessaoAtual,
  Sair,
} from '@application/auth/authUseCases';
import type { GetNavBadges } from '@application/navegacao/GetNavBadges';
import type { ListPerfis } from '@application/perfis/ListPerfis';
import type { UsuariosUseCases } from '@application/usuarios/usuariosUseCases';
import type { PermissoesUseCases } from '@application/permissoes/permissoesUseCases';
import type { AgentesUseCases } from '@application/agentes/agentesUseCases';
import { createContext, useContext, type ReactNode } from 'react';

export interface UseCases {
  auth: {
    concluirLogin: Pick<ConcluirLogin, 'execute'>;
    sessaoAtual: Pick<ObterSessaoAtual, 'execute'>;
    sair: Pick<Sair, 'execute'>;
    iniciarLogin: Pick<IniciarLogin, 'execute'>;
    encerrarNoProvedor: Pick<EncerrarNoProvedor, 'execute'>;
  };
  perfis: { list: Pick<ListPerfis, 'execute'> };
  navegacao: { badges: Pick<GetNavBadges, 'execute'> };
  usuarios: UsuariosUseCases;
  permissoes: PermissoesUseCases;
  agentes: AgentesUseCases;
}

const UseCasesContext = createContext<UseCases | null>(null);

export function UseCasesProvider({
  useCases,
  children,
}: {
  useCases: UseCases;
  children: ReactNode;
}) {
  return <UseCasesContext.Provider value={useCases}>{children}</UseCasesContext.Provider>;
}

export function useUseCases(): UseCases {
  const useCases = useContext(UseCasesContext);
  if (useCases === null) {
    throw new Error('useUseCases deve ser usado dentro de <UseCasesProvider>');
  }
  return useCases;
}
