import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';

export class CountPendentes {
  constructor(private readonly repository: AprovacaoRepository) {}

  execute(): Promise<number> {
    return this.repository.countPendentes();
  }
}
