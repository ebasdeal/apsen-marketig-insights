import type {
  Aprovacao,
  AprovacaoPatch,
  AprovFiltro,
  Intensidade,
} from '@domain/aprovacoes/Aprovacao';
import type { QueryParams } from '../http/HttpClient';
import type { AprovacaoApiDto } from './aprovacaoSchema';

export function toAprovacao(dto: AprovacaoApiDto): Aprovacao {
  return {
    id: dto.id,
    modo: dto.modo,
    produto: dto.produto,
    molecula: dto.molecula,
    tipo: dto.tipo,
    cat: dto.cat,
    periodo: { ini: dto.periodo.ini, fim: dto.periodo.fim },
    intensidade: dto.intensidade as Intensidade,
    registrante: dto.registrante,
    dataReg: dto.data_reg,
    status: dto.status,
    params: dto.params,
    motivoRejeicao: dto.motivo_rejeicao,
    justificativaRejeicao: dto.justificativa_rejeicao ?? '',
  };
}

export function toAprovacaoPatchDto(patch: AprovacaoPatch): Record<string, string> {
  const body: Record<string, string> = { status: patch.status };
  if (patch.motivoRejeicao !== undefined) {
    body.motivo_rejeicao = patch.motivoRejeicao;
  }
  if (patch.justificativaRejeicao !== undefined) {
    body.justificativa_rejeicao = patch.justificativaRejeicao;
  }
  return body;
}

export function toFiltroQuery(filtro: AprovFiltro): QueryParams {
  const query: QueryParams = {};
  const pares: [string, string][] = [
    ['q', filtro.q.trim()],
    ['data_reg_gte', filtro.ini],
    ['data_reg_lte', filtro.fim],
    ['tipo', filtro.tipo],
    ['status', filtro.status],
  ];
  pares.forEach(([chave, valor]) => {
    if (valor !== '') {
      query[chave] = valor;
    }
  });
  return query;
}
