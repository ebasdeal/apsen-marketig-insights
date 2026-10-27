import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import { resolucaoEm } from '@domain/restricoes/restricaoRules';

export class ResolverRestricao {
  constructor(
    private readonly repository: RestricaoRepository,
    private readonly now: () => Date,
  ) {}

  async execute(id: string): Promise<void> {
    await this.repository.update(id, { status: 'resolvida', resolucao: resolucaoEm(this.now()) });
  }
}
