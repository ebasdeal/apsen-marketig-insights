import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import type { ContagemRestricoesOutput } from './dto';

export class ContarRestricoes {
  constructor(private readonly repository: RestricaoRepository) {}

  async execute(): Promise<ContagemRestricoesOutput> {
    const [ativas, resolvidas] = await Promise.all([
      this.repository.count({ status: 'ativa' }),
      this.repository.count({ status: 'resolvida' }),
    ]);
    return { ativas, resolvidas };
  }
}
