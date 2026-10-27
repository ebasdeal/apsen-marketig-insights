import { badgeDoTipo } from '@domain/drivers/badgeTone';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import type { Categoria } from '@domain/drivers/lookups';
import {
  estrelas,
  parametrosResumo,
  periodoTexto,
  tituloDoDriver,
} from '@domain/drivers/resumoDriver';
import type { DriverListItemDto, DriversPageDto, DriversPageRequest } from './dto';

export function toDriverListItem(
  driver: Driver,
  categorias: readonly Categoria[],
  labels: Readonly<Record<string, string>>,
): DriverListItemDto {
  return {
    id: driver.id,
    badge: badgeDoTipo(driver.tipo, categorias, labels),
    titulo: tituloDoDriver(driver),
    periodo: periodoTexto(driver.periodo),
    estrelas: estrelas(driver.intensidadeEsperada),
    verba: driver.verbaRs !== null && driver.verbaRs > 0 ? driver.verbaRs : null,
    canais: [...driver.cobertura.canais],
    parametros: parametrosResumo(driver.parametros),
    observacoes: driver.observacoes,
  };
}

export class ListDrivers {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly lookups: DriverLookupRepository,
  ) {}

  async execute({ page, size }: DriversPageRequest): Promise<DriversPageDto> {
    const [resultado, categorias, config] = await Promise.all([
      this.drivers.list({ page, limit: size }),
      this.lookups.listCategorias(),
      this.lookups.getFormConfig(),
    ]);
    return {
      items: resultado.items.map((driver) => toDriverListItem(driver, categorias, config.labels)),
      total: resultado.total,
      page,
      size,
    };
  }
}
