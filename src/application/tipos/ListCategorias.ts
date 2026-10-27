import type { Categoria } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';

export class ListCategorias {
  constructor(private readonly repository: TipoRepository) {}

  async execute(): Promise<Categoria[]> {
    return [...(await this.repository.listCategorias())].sort((a, b) => a.id - b.id);
  }
}
