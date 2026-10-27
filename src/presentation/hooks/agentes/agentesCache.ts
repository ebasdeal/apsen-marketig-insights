import { montarAgentesResumo } from '@application/agentes/GetAgentesResumo';
import type { AgenteRowDto, AgentesPageDto, AgentesResumoDto } from '@application/agentes/dto';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { agentesKeys } from './agentesKeys';

export interface AgentesSnapshot {
  pages: [QueryKey, AgentesPageDto | undefined][];
  resumo: AgentesResumoDto | undefined;
}

export interface AgenteAtivoChange {
  id: string;
  papel: string;
  schedule: string;
  ativo: boolean;
}

export function atualizarLinhas(
  page: AgentesPageDto,
  id: string,
  change: Partial<AgenteRowDto>,
): AgentesPageDto {
  return { ...page, rows: page.rows.map((row) => (row.id === id ? { ...row, ...change } : row)) };
}

export function aplicarAtivoNoResumo(
  resumo: AgentesResumoDto,
  { id, papel, schedule, ativo }: AgenteAtivoChange,
): AgentesResumoDto {
  const presente = resumo.agendados.some((agente) => agente.id === id);
  if (presente === ativo) {
    return resumo;
  }
  const agendados = ativo
    ? [...resumo.agendados, { id, papel, schedule }]
    : resumo.agendados.filter((agente) => agente.id !== id);
  return montarAgentesResumo(resumo.total, resumo.ativos + (ativo ? 1 : -1), agendados);
}

export function setPaginas(
  queryClient: QueryClient,
  update: (page: AgentesPageDto) => AgentesPageDto,
): void {
  queryClient.setQueriesData<AgentesPageDto>({ queryKey: agentesKeys.pages() }, (page) =>
    page === undefined ? page : update(page),
  );
}

export async function snapshotAgentes(queryClient: QueryClient): Promise<AgentesSnapshot> {
  await queryClient.cancelQueries({ queryKey: agentesKeys.all });
  return {
    pages: queryClient.getQueriesData<AgentesPageDto>({ queryKey: agentesKeys.pages() }),
    resumo: queryClient.getQueryData<AgentesResumoDto>(agentesKeys.resumo()),
  };
}

export function restaurarAgentes(
  queryClient: QueryClient,
  snapshot: AgentesSnapshot | undefined,
): void {
  if (snapshot === undefined) {
    return;
  }
  snapshot.pages.forEach(([key, data]) => queryClient.setQueryData(key, data));
  queryClient.setQueryData(agentesKeys.resumo(), snapshot.resumo);
}

export function invalidarAgentes(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: agentesKeys.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}
