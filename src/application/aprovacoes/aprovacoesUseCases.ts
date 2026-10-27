import type { AprovarAprovacao } from './AprovarAprovacao';
import type { CountPendentes } from './CountPendentes';
import type { ListAprovacoes } from './ListAprovacoes';
import type { ListEmUso } from './ListEmUso';
import type { ReabrirAprovacao } from './ReabrirAprovacao';
import type { RejeitarAprovacao } from './RejeitarAprovacao';

export interface AprovacoesUseCases {
  list: Pick<ListAprovacoes, 'execute'>;
  pendentes: Pick<CountPendentes, 'execute'>;
  emUso: Pick<ListEmUso, 'execute'>;
  aprovar: Pick<AprovarAprovacao, 'execute'>;
  rejeitar: Pick<RejeitarAprovacao, 'execute'>;
  reabrir: Pick<ReabrirAprovacao, 'execute'>;
}
