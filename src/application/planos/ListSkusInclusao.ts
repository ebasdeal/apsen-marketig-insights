import { PLANO_SKUS_INCLUSAO } from '@domain/planos/planoConstants';
import type { SkuMetaRepository } from '@domain/planos/PlanoItemRepository';
import type { SkuOpcaoOutput } from './dto';

export class ListSkusInclusao {
  constructor(private readonly skuMeta: SkuMetaRepository) {}

  async execute(): Promise<SkuOpcaoOutput[]> {
    const metas = await this.skuMeta.listByIds(PLANO_SKUS_INCLUSAO);
    const porId = new Map(metas.map((meta) => [meta.id, meta]));
    return PLANO_SKUS_INCLUSAO.flatMap((id) => {
      const meta = porId.get(id);
      return meta === undefined
        ? []
        : [{ value: id, label: `${meta.nome} — ${meta.apres} · ${id}` }];
    });
  }
}
