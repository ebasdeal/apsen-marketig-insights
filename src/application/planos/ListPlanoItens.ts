import type { PlanoFiltro } from '@domain/planos/PlanoItem';
import type { CicloAtivoRepository, PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import type { PlanoListOutput } from './dto';
import { toPlanoItemRow } from './mappers';

export class ListPlanoItens {
  constructor(
    private readonly itens: PlanoItemRepository,
    private readonly ciclos: CicloAtivoRepository,
  ) {}

  async execute(filtro: PlanoFiltro): Promise<PlanoListOutput> {
    const [page, ciclo] = await Promise.all([
      this.itens.listPage(filtro),
      this.ciclos.cicloAtivoId(),
    ]);
    return {
      itens: page.items.map(toPlanoItemRow),
      total: page.total,
      pagina: page.page,
      tamanho: page.limit,
      ciclo,
    };
  }
}
