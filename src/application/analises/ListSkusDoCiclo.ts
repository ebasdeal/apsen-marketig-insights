import type { AnaliseApoioRepository } from '@domain/analises/AnaliseApoioRepository';
import { agruparPorFamilia, nivelEstoque } from '@domain/analises/analiseRules';
import type { SkuGrupoOutput } from './dto';

export class ListSkusDoCiclo {
  constructor(private readonly apoio: AnaliseApoioRepository) {}

  async execute(ciclo: string): Promise<SkuGrupoOutput[]> {
    if (ciclo === '') {
      return [];
    }
    const skus = await this.apoio.skusDoCiclo(ciclo);
    return agruparPorFamilia(skus).map((grupo) => ({
      familia: grupo.familia,
      skus: grupo.skus.map((sku) => ({
        codigo: sku.codigo,
        nome: sku.nome,
        dias: sku.dias,
        nivelEstoque: nivelEstoque(sku.dias),
      })),
    }));
  }
}
