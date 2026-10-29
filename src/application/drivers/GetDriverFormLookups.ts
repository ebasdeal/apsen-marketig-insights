import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import { comObrigatoriedadeDoTipo, slugsAtivos } from '@domain/drivers/camposDinamicos';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { DriverFormLookupsDto } from './dto';

export class GetDriverFormLookups {
  constructor(
    private readonly lookups: DriverLookupRepository,
    private readonly catalog: ProductCatalogRepository,
  ) {}

  async execute(): Promise<DriverFormLookupsDto> {
    const [categorias, tipos, camposTipo, intensidades, config, franquias] = await Promise.all([
      this.lookups.listCategorias(),
      this.lookups.listTipos(),
      this.lookups.listCamposTipo(),
      this.lookups.listIntensidades(),
      this.lookups.getFormConfig(),
      this.catalog.listFranquias(),
    ]);
    const ordenadas = [...categorias].sort((a, b) => a.id - b.id);
    return {
      categorias: ordenadas,
      tiposAtivos: slugsAtivos(ordenadas, tipos),
      donoPorTipo: Object.fromEntries(
        tipos.flatMap((tipo) => (tipo.dono === undefined ? [] : [[tipo.slug, tipo.dono]])),
      ),
      camposPorTipo: Object.fromEntries(
        camposTipo.map((campos) => [campos.id, comObrigatoriedadeDoTipo(campos)]),
      ),
      intensidades: [...intensidades].sort((a, b) => a.id - b.id),
      config,
      franquias,
    };
  }
}
