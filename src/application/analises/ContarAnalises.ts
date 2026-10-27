import type { AnaliseContagemFiltro, AnaliseRepository } from '@domain/analises/AnaliseRepository';

export class ContarAnalises {
  constructor(private readonly repository: AnaliseRepository) {}

  execute(filtro?: AnaliseContagemFiltro): Promise<number> {
    return filtro === undefined ? this.repository.count() : this.repository.count(filtro);
  }
}
