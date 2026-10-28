import type { Analise } from '@domain/analises/Analise';
import { ANALISE_STATUS_LABEL, ANALISES_POR_PAGINA } from '@domain/analises/analiseConstants';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import type { AnaliseCardOutput, ListAnalisesInput, ListAnalisesOutput } from './dto';

export function toAnaliseCard(analise: Analise): AnaliseCardOutput {
  return {
    id: analise.id,
    titulo: analise.titulo,
    status: analise.status,
    statusLabel: ANALISE_STATUS_LABEL[analise.status],
    ciclo: analise.ciclo,
    skusCount: analise.skus.length,
    modelo: analise.modelo,
    criada: analise.criada,
  };
}

export class ListAnalises {
  constructor(private readonly repository: AnaliseRepository) {}

  async execute(input: ListAnalisesInput): Promise<ListAnalisesOutput> {
    const pagina = Math.max(1, Math.trunc(input.pagina) || 1);
    const page = await this.repository.listPage({
      busca: input.busca.trim(),
      status: input.status,
      pagina,
      tamanho: ANALISES_POR_PAGINA,
      ...(input.criadoPor === undefined ? {} : { criadoPor: input.criadoPor }),
    });
    return {
      itens: page.items.map(toAnaliseCard),
      total: page.total,
      pagina,
      tamanho: ANALISES_POR_PAGINA,
    };
  }
}
