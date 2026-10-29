import type { PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import type { PlanoItemDetailOutput } from './dto';
import { toPlanoItemDetail } from './mappers';

export class GetPlanoItem {
  constructor(private readonly itens: PlanoItemRepository) {}

  async execute(id: string): Promise<PlanoItemDetailOutput> {
    return toPlanoItemDetail(await this.itens.get(id));
  }
}
