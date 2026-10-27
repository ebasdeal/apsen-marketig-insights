import type { AprovStatus, Decisao, Periodo } from './Aprovacao';
import type { RejeicaoErrors } from './errors';
import { PERMANENTE_FIM } from './vocabulario';

export function formatDataBr(iso: string): string {
  return iso.split('-').reverse().join('/');
}

export function formatPeriodo({ ini, fim }: Periodo): string {
  return `${formatDataBr(ini)} → ${fim === PERMANENTE_FIM ? 'Permanente' : formatDataBr(fim)}`;
}

export function pluralPendentes(n: number): string {
  return `${n} pendente${n === 1 ? '' : 's'}`;
}

export interface ResumoTexto {
  registros: string;
  pendentes: string | null;
}

export function resumoTexto(total: number, pendentes: number): ResumoTexto {
  const s = total === 1 ? '' : 's';
  return {
    registros: `${total} registro${s} encontrado${s}`,
    pendentes: pendentes > 0 ? pluralPendentes(pendentes) : null,
  };
}

export function validateRejeicao(input: { motivo: string; justificativa: string }): RejeicaoErrors {
  const errors: RejeicaoErrors = {};
  if (input.motivo.trim() === '') {
    errors.motivo = '⚠️ Selecione o motivo da rejeição.';
  }
  if (input.justificativa.trim() === '') {
    errors.justificativa = '⚠️ Informe a justificativa.';
  }
  return errors;
}

export interface EstadoDecisao {
  status: AprovStatus;
  motivoRejeicao: string;
  justificativaRejeicao: string;
}

export function estadoDaDecisao(decisao: Decisao): EstadoDecisao {
  if (decisao.tipo === 'aprovar') {
    return { status: 'aprovado', motivoRejeicao: '', justificativaRejeicao: '' };
  }
  if (decisao.tipo === 'rejeitar') {
    return {
      status: 'rejeitado',
      motivoRejeicao: decisao.motivo.trim(),
      justificativaRejeicao: decisao.justificativa.trim(),
    };
  }
  return { status: 'pendente', motivoRejeicao: '', justificativaRejeicao: '' };
}

export function aplicarDecisao<T extends EstadoDecisao>(item: T, decisao: Decisao): T {
  return { ...item, ...estadoDaDecisao(decisao) };
}

export function deltaPendentes(anterior: AprovStatus, decisao: Decisao): number {
  const novo = estadoDaDecisao(decisao).status;
  if (anterior === novo) {
    return 0;
  }
  if (novo === 'pendente') {
    return 1;
  }
  return anterior === 'pendente' ? -1 : 0;
}
