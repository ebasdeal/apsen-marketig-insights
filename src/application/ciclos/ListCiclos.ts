import type { Ciclo } from '@domain/ciclos/Ciclo';
import type { CicloPageQuery, CicloRepository } from '@domain/ciclos/CicloRepository';
import type { CicloRowDto, CiclosPageDto } from './dto';

export function toCicloRowDto(ciclo: Ciclo): CicloRowDto {
  return {
    id: ciclo.id,
    codigo: ciclo.codigo,
    descricao: ciclo.descricao,
    meta: ciclo.meta,
    periodo: ciclo.periodo,
    drivers: ciclo.drivers,
    responsavel: ciclo.responsavel,
    status: ciclo.status,
    inicio: ciclo.inicio,
    fim: ciclo.fim,
  };
}

export class ListCiclos {
  constructor(private readonly repository: CicloRepository) {}

  async execute(query: CicloPageQuery): Promise<CiclosPageDto> {
    const { items, total } = await this.repository.listPage(query);
    return {
      rows: items.map(toCicloRowDto),
      total,
      totalPages: Math.ceil(total / query.size),
    };
  }
}
