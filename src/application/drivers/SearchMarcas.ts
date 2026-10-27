import { filtrarSugestoes } from '@domain/drivers/concorrentes';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { SearchMarcasInput } from './dto';

export class SearchMarcas {
  constructor(private readonly lookups: DriverLookupRepository) {}

  async execute({ laboratorio, termo }: SearchMarcasInput): Promise<string[]> {
    const lab = laboratorio.trim();
    if (lab === '') {
      return [];
    }
    return filtrarSugestoes(await this.lookups.getMarcas(lab), termo);
  }
}
