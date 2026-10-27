import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';

export class ListEmUso {
  constructor(private readonly repository: AprovacaoRepository) {}

  execute(): Promise<string[]> {
    return this.repository.listEmUso();
  }
}
