import type {
  Aprovacao,
  AprovacaoPatch,
  AprovFiltro,
  DecisaoRegistrada,
  Intensidade,
} from '@domain/aprovacoes/Aprovacao';
import type { QueryParams } from '../http/HttpClient';
import type { AprovacaoApiDto } from './aprovacaoSchema';

function decisaoDoDto(dto: AprovacaoApiDto): DecisaoRegistrada | null {
  const por = {
    aprovado: [dto.aprovado_por, dto.aprovado_em],
    rejeitado: [dto.rejeitado_por, dto.rejeitado_em],
    pendente: [dto.reaberto_por, dto.reaberto_em],
  }[dto.status];
  const tipo = dto.status === 'pendente' ? 'reaberto' : dto.status;
  const [quem, quando] = por;
  return quem === undefined || quem === '' || quando === undefined || quando === ''
    ? null
    : { tipo, por: quem, em: quando };
}

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
    decisao: decisaoDoDto(dto),
    ...(dto.driver_id === undefined ? {} : { driverId: dto.driver_id }),
    ...(dto.titulo === undefined || dto.titulo === '' ? {} : { titulo: dto.titulo }),
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
  if (patch.decisao !== undefined) {
    const { tipo, por, em } = patch.decisao;
    body.aprovado_por = tipo === 'aprovado' ? por : '';
    body.aprovado_em = tipo === 'aprovado' ? em : '';
    body.rejeitado_por = tipo === 'rejeitado' ? por : '';
    body.rejeitado_em = tipo === 'rejeitado' ? em : '';
    body.reaberto_por = tipo === 'reaberto' ? por : '';
    body.reaberto_em = tipo === 'reaberto' ? em : '';
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

export function toAprovacaoDto(item: Aprovacao): Record<string, unknown> {
  return {
    id: item.id,
    modo: item.modo,
    produto: item.produto,
    molecula: item.molecula,
    tipo: item.tipo,
    cat: item.cat,
    periodo: { ini: item.periodo.ini, fim: item.periodo.fim },
    intensidade: item.intensidade,
    registrante: item.registrante,
    data_reg: item.dataReg,
    status: item.status,
    params: item.params,
    motivo_rejeicao: item.motivoRejeicao,
    justificativa_rejeicao: item.justificativaRejeicao,
    ...(item.driverId === undefined ? {} : { driver_id: item.driverId }),
    ...(item.titulo === undefined ? {} : { titulo: item.titulo }),
    ...(item.decisao === null
      ? {}
      : toAprovacaoPatchDto({ status: item.status, decisao: item.decisao })),
  };
}
