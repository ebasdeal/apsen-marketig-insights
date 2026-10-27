import type { AnaliseStatus } from '@domain/analises/Analise';
import { dataHoraBr } from '@domain/analises/analiseDatas';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import { statusAoSalvar } from '@domain/analises/analiseRules';

export class SalvarAnalise {
  constructor(
    private readonly repository: AnaliseRepository,
    private readonly now: () => Date,
  ) {}

  async execute(id: string): Promise<AnaliseStatus> {
    const atual = await this.repository.get(id);
    const status = statusAoSalvar(atual.status);
    await this.repository.update(id, { status, salvoEm: dataHoraBr(this.now()) });
    return status;
  }
}
