import type { RestricaoStatus } from '@domain/restricoes/Restricao';
import { RESTRICOES_POR_PAGINA } from '@domain/restricoes/restricaoConstants';
import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import type { ListRestricoesInput, RestricoesAba, RestricoesPaginaOutput } from './dto';
import { toRestricaoItemOutput } from './mappers';

export function statusDaAba(aba: RestricoesAba): RestricaoStatus {
  return aba === 'ativas' ? 'ativa' : 'resolvida';
}

export class ListRestricoes {
  constructor(private readonly repository: RestricaoRepository) {}

  async execute({ aba, pagina }: ListRestricoesInput): Promise<RestricoesPaginaOutput> {
    const page = await this.repository.listPage(
      { status: statusDaAba(aba) },
      pagina,
      RESTRICOES_POR_PAGINA,
    );
    return {
      itens: page.items.map(toRestricaoItemOutput),
      total: page.total,
      pagina: page.page,
      tamanho: page.limit,
    };
  }
}
