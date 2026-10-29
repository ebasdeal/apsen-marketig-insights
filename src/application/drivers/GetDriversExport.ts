import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { nomeArquivoExport, textoDoExport } from '@domain/drivers/exportPayload';
import type { DriversExportDto } from './dto';

export class GetDriversExport {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly lookups: DriverLookupRepository,
    private readonly clock: () => Date,
  ) {}

  async execute(): Promise<DriversExportDto> {
    const [drivers, config] = await Promise.all([
      this.drivers.listAll(),
      this.lookups.getFormConfig(),
    ]);
    const agora = this.clock();
    return {
      texto: textoDoExport(drivers, config, agora),
      nomeArquivo: nomeArquivoExport(agora),
      total: drivers.length,
    };
  }
}
