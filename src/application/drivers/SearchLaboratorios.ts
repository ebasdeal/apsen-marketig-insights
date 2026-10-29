import { LIMITE_SUGESTOES_SEM_TERMO } from '@domain/drivers/concorrentes';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';

export const LIMITE_LABORATORIOS = 20;

export class SearchLaboratorios {
  constructor(private readonly lookups: DriverLookupRepository) {}

  execute(termo: string): Promise<string[]> {
    const busca = termo.trim();
    return this.lookups.searchLaboratorios(
      busca,
      busca === '' ? LIMITE_SUGESTOES_SEM_TERMO : LIMITE_LABORATORIOS,
    );
  }
}
