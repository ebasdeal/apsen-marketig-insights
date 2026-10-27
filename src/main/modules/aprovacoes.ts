import { AprovarAprovacao } from '@application/aprovacoes/AprovarAprovacao';
import type { AprovacoesUseCases } from '@application/aprovacoes/aprovacoesUseCases';
import { CountPendentes } from '@application/aprovacoes/CountPendentes';
import { ListAprovacoes } from '@application/aprovacoes/ListAprovacoes';
import { ListEmUso } from '@application/aprovacoes/ListEmUso';
import { ReabrirAprovacao } from '@application/aprovacoes/ReabrirAprovacao';
import { RejeitarAprovacao } from '@application/aprovacoes/RejeitarAprovacao';
import { HttpAprovacaoRepository } from '@infrastructure/aprovacoes/HttpAprovacaoRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export function createAprovacoesModule(http: HttpClient): AprovacoesUseCases {
  const repository = new HttpAprovacaoRepository(http);
  return {
    list: new ListAprovacoes(repository),
    pendentes: new CountPendentes(repository),
    emUso: new ListEmUso(repository),
    aprovar: new AprovarAprovacao(repository),
    rejeitar: new RejeitarAprovacao(repository),
    reabrir: new ReabrirAprovacao(repository),
  };
}
