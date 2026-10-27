import type { CicloRowDto, CiclosPageDto, CiclosResumoDto } from '@application/ciclos/dto';
import type { Ciclo } from '@domain/ciclos/Ciclo';

export const CICLO_DTOS_FIXTURE = [
  {
    id: 'PLP-2026-07',
    descricao: 'Planejamento Julho 2026',
    meta: 'Criado em 01/06/2026 · v1',
    inicio: '2026-07-01',
    fim: '2026-07-31',
    periodo: '01/07 → 31/07/2026',
    drivers: 4,
    responsavel: 'Ana Planejadora',
    status: 'ativo',
    versao: 1,
  },
  {
    id: 'PLP-2026-06',
    descricao: 'Planejamento Junho 2026',
    meta: 'Encerrado em 30/06/2026 · v2',
    inicio: '2026-06-01',
    fim: '2026-06-30',
    periodo: '01/06 → 30/06/2026',
    drivers: 7,
    responsavel: 'Carlos Planejador',
    status: 'encerrado',
    versao: 2,
  },
  {
    id: 'PLP-2026-05',
    descricao: 'Planejamento Maio 2026',
    meta: 'Encerrado em 31/05/2026 · v1',
    inicio: '2026-05-01',
    fim: '2026-05-31',
    periodo: '01/05 → 31/05/2026',
    drivers: 5,
    responsavel: 'Ana Planejadora',
    status: 'encerrado',
    versao: 1,
  },
] as const;

export const CICLOS_FIXTURE: readonly Ciclo[] = CICLO_DTOS_FIXTURE.map((dto) => ({
  ...dto,
  codigo: dto.id,
}));

export const CICLO_ATIVO = CICLOS_FIXTURE[0] as Ciclo;

export const CICLO_RASCUNHO: Ciclo = {
  ...CICLO_ATIVO,
  id: '3f6c1e0a-6d2b-4c51-9a77-2b1f0d6c9e10',
  codigo: 'PLP-2026-08',
  descricao: 'Planejamento Agosto 2026',
  meta: 'Criado em 27/10/2026 · v1',
  inicio: '2026-08-01',
  fim: '2026-08-31',
  periodo: '01/08 → 31/08/2026',
  drivers: 0,
  status: 'rascunho',
};

export function cicloRow(ciclo: Ciclo): CicloRowDto {
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

export const CICLOS_PAGE_FIXTURE: CiclosPageDto = {
  rows: CICLOS_FIXTURE.map(cicloRow),
  total: 3,
  totalPages: 1,
};

export const CICLOS_RESUMO_FIXTURE: CiclosResumoDto = {
  total: 3,
  ativos: 1,
  ativo: { id: 'PLP-2026-07', codigo: 'PLP-2026-07', mesAno: 'Julho 2026' },
  proximoCodigo: 'PLP-2026-08',
  proximoPeriodo: { inicio: '2026-08-01', fim: '2026-08-31' },
};
