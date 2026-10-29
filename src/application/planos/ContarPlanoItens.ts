import type { CicloAtivoRepository, PlanoItemRepository } from '@domain/planos/PlanoItemRepository';

export class ContarPlanoItens {
  constructor(
    private readonly itens: PlanoItemRepository,
    private readonly ciclos: CicloAtivoRepository,
  ) {}

  async execute(): Promise<number> {
    const ciclo = await this.ciclos.cicloAtivoId();
    return ciclo === null ? 0 : this.itens.count({ ciclo });
  }
}
