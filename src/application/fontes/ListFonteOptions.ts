import type { FonteRepository } from '@domain/fontes/FonteRepository';
import { optionLabel } from '@domain/fontes/fonteRules';
import type { FonteOptionDto } from './dto';

export class ListFonteOptions {
  constructor(private readonly repository: FonteRepository) {}

  async execute(): Promise<FonteOptionDto[]> {
    const fontes = await this.repository.listAll();
    return fontes.map((fonte) => ({ value: fonte.id, label: optionLabel(fonte) }));
  }
}
