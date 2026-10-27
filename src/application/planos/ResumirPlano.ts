import { PLANO_STATUS } from '@domain/planos/planoConstants';
import type { PlanoStatus } from '@domain/planos/PlanoItem';
import type { PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import type { ResumoPlanoOutput } from './dto';

export class ResumirPlano {
  constructor(private readonly itens: PlanoItemRepository) {}

  async execute(): Promise<ResumoPlanoOutput> {
    const [total, contagens] = await Promise.all([
      this.itens.count(),
      Promise.all(
        PLANO_STATUS.map(async (status) => [status, await this.itens.count({ status })] as const),
      ),
    ]);
    return { total, porStatus: Object.fromEntries(contagens) as Record<PlanoStatus, number> };
  }
}
