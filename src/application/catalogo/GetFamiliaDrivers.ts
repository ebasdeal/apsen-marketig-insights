import { driversDaFamilia } from '@domain/catalogo/driversDaFamilia';
import { nivelDoDriver } from '@domain/catalogo/nivel';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import { badgeDoTipo } from '@domain/drivers/badgeTone';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { estrelas, periodoTexto } from '@domain/drivers/resumoDriver';
import type { FamiliaDriversDto } from './dto';

export class GetFamiliaDrivers {
  constructor(
    private readonly catalog: ProductCatalogRepository,
    private readonly drivers: DriverRepository,
    private readonly lookups: DriverLookupRepository,
  ) {}

  async execute(familia: string): Promise<FamiliaDriversDto> {
    const [registro, drivers, categorias, config] = await Promise.all([
      this.catalog.getFamilia(familia),
      this.drivers.listAll(),
      this.lookups.listCategorias(),
      this.lookups.getFormConfig(),
    ]);
    const daFamilia = driversDaFamilia(drivers, registro.franquia, registro.id, registro.skus);
    return {
      franquia: registro.franquia,
      familia: registro.id,
      drivers: daFamilia.map((driver) => ({
        id: driver.id,
        badge: badgeDoTipo(driver.tipo, categorias, config.labels),
        titulo: driver.titulo === '' ? '—' : driver.titulo,
        produto: driver.produto,
        periodo: periodoTexto(driver.periodo),
        nivel: nivelDoDriver(driver.modo),
        intensidade: driver.intensidadeEsperada,
        estrelas: estrelas(driver.intensidadeEsperada),
      })),
    };
  }
}
