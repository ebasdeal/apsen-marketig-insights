import type { PlanoItemRepository } from '@domain/planos/PlanoItemRepository';

export class ExcluirPlanoItem {
  constructor(private readonly itens: PlanoItemRepository) {}

  execute(id: string): Promise<void> {
    return this.itens.delete(id);
  }
}
