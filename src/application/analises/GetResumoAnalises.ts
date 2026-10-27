import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import type { ResumoAnalisesOutput } from './dto';

export class GetResumoAnalises {
  constructor(private readonly repository: AnaliseRepository) {}

  async execute(): Promise<ResumoAnalisesOutput> {
    const [total, salvas, relatorios] = await Promise.all([
      this.repository.count(),
      this.repository.count({ status: 'salva' }),
      this.repository.count({ status: 'relatorio' }),
    ]);
    return { total, salvas: salvas + relatorios };
  }
}
