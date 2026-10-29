import type { PlanoItemForm } from '@domain/planos/PlanoItem';
import type { PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import { alteracoesDoItem } from '@domain/planos/planoRules';
import type { PlanoItemAtualizadoOutput } from './dto';

export class AtualizarPlanoItem {
  constructor(private readonly itens: PlanoItemRepository) {}

  async execute(id: string, form: PlanoItemForm): Promise<PlanoItemAtualizadoOutput> {
    const atualizado = await this.itens.update(id, alteracoesDoItem(form));
    return { codigo: atualizado.codigo };
  }
}
