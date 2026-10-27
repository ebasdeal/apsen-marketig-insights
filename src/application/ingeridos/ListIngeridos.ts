import type { IngeridoRepository } from '@domain/ingeridos/IngeridoRepository';
import { INGERIDOS_PAGE_SIZE, resumoIngeridos } from '@domain/ingeridos/ingeridoRules';
import { pageCountOf } from '@domain/shared/Page';
import { toIngeridoRowDto, type ListIngeridosInput, type ListIngeridosResult } from './dto';

export class ListIngeridos {
  constructor(private readonly repository: IngeridoRepository) {}

  async execute({ filtro, page }: ListIngeridosInput): Promise<ListIngeridosResult> {
    const pagina = await this.repository.listPage(filtro, { page, size: INGERIDOS_PAGE_SIZE });
    return {
      rows: pagina.items.map(toIngeridoRowDto),
      total: pagina.total,
      totalPages: pageCountOf(pagina.total, INGERIDOS_PAGE_SIZE),
      resumo: resumoIngeridos(pagina.total),
    };
  }
}
