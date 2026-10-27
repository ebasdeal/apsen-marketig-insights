import type { PlanoItemRepository } from '@domain/planos/PlanoItemRepository';

export class ContarPlanoItens {
  constructor(private readonly itens: PlanoItemRepository) {}

  execute(): Promise<number> {
    return this.itens.count();
  }
}
