import type {
  Aprovacao,
  AprovFiltro,
  AprovStatus,
  Decisao,
  DecisaoRegistrada,
} from '@domain/aprovacoes/Aprovacao';
import {
  estadoDaDecisao,
  formatDataBr,
  formatPeriodo,
  textoDecisao,
} from '@domain/aprovacoes/aprovacaoRules';
import { INT_LABEL, INT_TONE, STATUS_CFG, type AprovTone } from '@domain/aprovacoes/vocabulario';

export interface AprovacaoCardDto {
  id: string;
  modoLabel: string;
  modoTone: AprovTone;
  statusLabel: string;
  statusTone: AprovTone;
  meta: string;
  produto: string;
  molecula: string;
  tipo: string;
  periodo: string;
  intensidadeLabel: string;
  intensidadeTone: AprovTone | '';
  params: string;
  status: AprovStatus;
  motivo: string;
  justificativa: string;
  emUso: boolean;
  decisao: string;
}

export interface ListAprovacoesInput {
  filtro: AprovFiltro;
  page: number;
}

export interface ListAprovacoesResult {
  cards: AprovacaoCardDto[];
  total: number;
  totalPages: number;
  pendentesNoResultado: number;
}

export interface DecidirInput {
  id: string;
  por: string;
}

export interface RejeitarInput {
  id: string;
  por: string;
  motivo: string;
  justificativa: string;
}

export interface ToastDto {
  toast: string;
}

export function toAprovacaoCardDto(item: Aprovacao, emUso: boolean): AprovacaoCardDto {
  const status = STATUS_CFG[item.status];
  const molecula = item.modo === 'Molécula';
  return {
    id: item.id,
    modoLabel: molecula ? 'Por Molécula' : 'Por SKU',
    modoTone: molecula ? 'purple' : 'blue',
    statusLabel: status.label,
    statusTone: status.tone,
    meta: `Registrado por ${item.registrante} · ${formatDataBr(item.dataReg)}`,
    produto: item.produto,
    molecula: item.molecula,
    tipo: item.tipo,
    periodo: formatPeriodo(item.periodo),
    intensidadeLabel: INT_LABEL[item.intensidade],
    intensidadeTone: INT_TONE[item.intensidade],
    params: item.params,
    status: item.status,
    motivo: item.motivoRejeicao,
    justificativa: item.justificativaRejeicao,
    emUso,
    decisao: textoDecisao(item.decisao),
  };
}

export function aplicarDecisaoNoCard(
  card: AprovacaoCardDto,
  decisao: Decisao,
  registro: DecisaoRegistrada | null = null,
): AprovacaoCardDto {
  const estado = estadoDaDecisao(decisao);
  const status = STATUS_CFG[estado.status];
  return {
    ...card,
    status: estado.status,
    statusLabel: status.label,
    statusTone: status.tone,
    motivo: estado.motivoRejeicao,
    justificativa: estado.justificativaRejeicao,
    decisao: textoDecisao(registro),
  };
}
