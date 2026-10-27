import type { Ciclo } from '@domain/ciclos/Ciclo';
import type { CicloApiDto } from './cicloSchema';

export function toCiclo(dto: CicloApiDto): Ciclo {
  return {
    id: dto.id,
    codigo: dto.codigo ?? dto.id,
    descricao: dto.descricao,
    meta: dto.meta,
    inicio: dto.inicio,
    fim: dto.fim,
    periodo: dto.periodo,
    drivers: dto.drivers,
    responsavel: dto.responsavel,
    status: dto.status,
    versao: dto.versao,
  };
}

export function toCicloDto(ciclo: Ciclo): CicloApiDto {
  return {
    id: ciclo.id,
    codigo: ciclo.codigo,
    descricao: ciclo.descricao,
    meta: ciclo.meta,
    inicio: ciclo.inicio,
    fim: ciclo.fim,
    periodo: ciclo.periodo,
    drivers: ciclo.drivers,
    responsavel: ciclo.responsavel,
    status: ciclo.status,
    versao: ciclo.versao,
  };
}
