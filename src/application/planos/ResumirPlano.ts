import { PLANO_STATUS } from '@domain/planos/planoConstants';
import type { PlanoStatus } from '@domain/planos/PlanoItem';
import type { CicloAtivoRepository, PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import type { ResumoPlanoOutput } from './dto';

export class ResumirPlano {
  constructor(
    private readonly itens: PlanoItemRepository,
    private readonly ciclos: CicloAtivoRepository,
  ) {}

  async execute(): Promise<ResumoPlanoOutput> {
    const ciclo = await this.ciclos.cicloAtivoId();
    if (ciclo === null) {
      return {
        total: 0,
        porStatus: Object.fromEntries(PLANO_STATUS.map((status) => [status, 0])) as Record<
          PlanoStatus,
          number
        >,
      };
    }
    const [total, contagens] = await Promise.all([
      this.itens.count({ ciclo }),
      Promise.all(
        PLANO_STATUS.map(
          async (status) => [status, await this.itens.count({ status, ciclo })] as const,
        ),
      ),
    ]);
    return { total, porStatus: Object.fromEntries(contagens) as Record<PlanoStatus, number> };
  }
}
