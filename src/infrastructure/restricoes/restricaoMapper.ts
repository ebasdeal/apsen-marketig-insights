import type { Restricao } from '@domain/restricoes/Restricao';
import type { RestricaoDto } from './restricaoSchemas';

export function toRestricao(dto: RestricaoDto): Restricao {
  return {
    id: dto.id,
    codigo: dto.codigo ?? dto.id,
    tipo: dto.tipo,
    label: dto.label,
    desc: dto.desc,
    det: dto.det,
    produto: dto.produto,
    impacto: dto.impacto,
    impCor: dto.impCor,
    prazo: dto.prazo,
    resp: dto.resp,
    sev: dto.sev,
    status: dto.status,
    obs: dto.obs,
    resolucao: dto.resolucao ?? null,
  };
}

export function toRestricaoDto(restricao: Restricao): RestricaoDto {
  const { resolucao, ...resto } = restricao;
  return resolucao === null ? resto : { ...resto, resolucao };
}
