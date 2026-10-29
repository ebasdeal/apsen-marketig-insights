import type { CicloFonte, DriverAprovadoFonte } from '@domain/analises/AnaliseApoioRepository';
import { FILTRO_VAZIO } from '@domain/aprovacoes/Aprovacao';
import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import type { CicloRepository } from '@domain/ciclos/CicloRepository';

const LIMITE_CICLOS = 50;

export function cicloFonte(repository: CicloRepository): CicloFonte {
  return {
    async listCiclos() {
      const page = await repository.listPage({ page: 1, size: LIMITE_CICLOS });
      return page.items.map((ciclo) => ({
        id: ciclo.codigo,
        descricao: ciclo.descricao,
        status: ciclo.status,
      }));
    },
  };
}

export function driverAprovadoFonte(repository: AprovacaoRepository): DriverAprovadoFonte {
  return {
    async listAprovados(limite) {
      const page = await repository.listPage(
        { ...FILTRO_VAZIO, status: 'aprovado' },
        { page: 1, size: limite },
      );
      return {
        items: page.items.map((aprovacao) => ({
          id: aprovacao.id,
          tipo: aprovacao.tipo,
          produto: aprovacao.produto,
          params: aprovacao.params,
          intensidade: aprovacao.intensidade,
        })),
        total: page.total,
        page: 1,
        limit: limite,
      };
    },
  };
}
