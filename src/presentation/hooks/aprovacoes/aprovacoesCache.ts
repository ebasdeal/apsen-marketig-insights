import { aplicarDecisaoNoCard, type ListAprovacoesResult } from '@application/aprovacoes/dto';
import type { AprovStatus, Decisao, DecisaoRegistrada } from '@domain/aprovacoes/Aprovacao';
import { deltaPendentes } from '@domain/aprovacoes/aprovacaoRules';
import type { NavBadges } from '@domain/navegacao/NavBadges';

export interface DecisaoInput {
  id: string;
  decisao: Decisao;
  registro?: DecisaoRegistrada;
}

export function statusAnterior(
  results: readonly (ListAprovacoesResult | undefined)[],
  { id, decisao }: DecisaoInput,
): AprovStatus {
  for (const result of results) {
    const card = result?.cards.find((candidato) => candidato.id === id);
    if (card !== undefined) {
      return card.status;
    }
  }
  return decisao.tipo === 'reabrir' ? 'aprovado' : 'pendente';
}

export function aplicarNaPagina(
  result: ListAprovacoesResult | undefined,
  { id, decisao, registro }: DecisaoInput,
): ListAprovacoesResult | undefined {
  const card = result?.cards.find((candidato) => candidato.id === id);
  if (result === undefined || card === undefined) {
    return result;
  }
  return {
    ...result,
    cards: result.cards.map((item) =>
      item.id === id ? aplicarDecisaoNoCard(item, decisao, registro ?? null) : item,
    ),
    pendentesNoResultado: Math.max(
      0,
      result.pendentesNoResultado + deltaPendentes(card.status, decisao),
    ),
  };
}

export function ajustarContagem(total: number | undefined, delta: number): number | undefined {
  return total === undefined ? undefined : Math.max(0, total + delta);
}

export function ajustarBadges(badges: NavBadges | undefined, delta: number): NavBadges | undefined {
  if (badges === undefined || badges.aprovacoes === null) {
    return badges;
  }
  return { ...badges, aprovacoes: Math.max(0, badges.aprovacoes + delta) };
}
