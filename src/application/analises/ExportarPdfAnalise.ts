import type { AnaliseStatus } from '@domain/analises/Analise';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import { exportarPdf } from '@domain/analises/analiseRules';

export class ExportarPdfAnalise {
  constructor(private readonly repository: AnaliseRepository) {}

  async execute(id: string): Promise<AnaliseStatus> {
    const atual = await this.repository.get(id);
    const status = exportarPdf(atual.status);
    await this.repository.update(id, { status });
    return status;
  }
}
