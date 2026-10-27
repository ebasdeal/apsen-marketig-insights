import { RESTRICAO_TIPOS } from '@domain/restricoes/restricaoConstants';
import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import type { ResumoRestricoesOutput } from './dto';

export class ResumirRestricoes {
  constructor(private readonly repository: RestricaoRepository) {}

  async execute(): Promise<ResumoRestricoesOutput> {
    const [ativas, criticas, porTipo] = await Promise.all([
      this.repository.count({ status: 'ativa' }),
      this.repository.count({ status: 'ativa', sev: 'critica' }),
      Promise.all(
        RESTRICAO_TIPOS.map(async (tipo) => ({
          tipo,
          n: await this.repository.count({ status: 'ativa', tipo }),
        })),
      ),
    ]);
    return { ativas, criticas, porTipo };
  }
}
