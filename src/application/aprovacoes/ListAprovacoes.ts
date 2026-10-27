import type { AprovFiltro } from '@domain/aprovacoes/Aprovacao';
import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { APROV_PAGE_SIZE } from '@domain/aprovacoes/vocabulario';
import { pageCountOf } from '@domain/shared/Page';
import { toAprovacaoCardDto, type ListAprovacoesInput, type ListAprovacoesResult } from './dto';

export class ListAprovacoes {
  constructor(private readonly repository: AprovacaoRepository) {}

  async execute({ filtro, page }: ListAprovacoesInput): Promise<ListAprovacoesResult> {
    const [pagina, pendentesNoResultado, emUso] = await Promise.all([
      this.repository.listPage(filtro, { page, size: APROV_PAGE_SIZE }),
      this.pendentesNoResultado(filtro),
      this.repository.listEmUso(),
    ]);
    const ingeridos = new Set(emUso);
    return {
      cards: pagina.items.map((item) => toAprovacaoCardDto(item, ingeridos.has(item.id))),
      total: pagina.total,
      totalPages: pageCountOf(pagina.total, APROV_PAGE_SIZE),
      pendentesNoResultado,
    };
  }

  private async pendentesNoResultado(filtro: AprovFiltro): Promise<number> {
    if (filtro.status === 'aprovado' || filtro.status === 'rejeitado') {
      return 0;
    }
    return this.repository.countPendentes({ ...filtro, status: 'pendente' });
  }
}
