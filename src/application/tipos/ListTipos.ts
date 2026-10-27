import { pageCountOf } from '@domain/shared/Page';
import type { Tipo } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { featureTone, formatLag } from '@domain/tipos/tipoRules';
import type { ListTiposInput, ListTiposResult, TipoRowDto } from './dto';

export function toTipoRowDto(tipo: Tipo): TipoRowDto {
  return {
    id: tipo.id,
    slug: tipo.slug,
    label: tipo.label,
    catL: tipo.catL,
    dono: tipo.dono,
    feature: tipo.feature,
    featureTone: featureTone(tipo.feature),
    lagTxt: formatLag(tipo.lag),
    params: tipo.params,
    ativo: tipo.ativo,
  };
}

export class ListTipos {
  constructor(private readonly repository: TipoRepository) {}

  async execute({ page, size, cat }: ListTiposInput): Promise<ListTiposResult> {
    const request = cat === undefined ? { page, size } : { page, size, cat };
    const [pagina, total, ativos] = await Promise.all([
      this.repository.listPage(request),
      this.repository.count(),
      this.repository.count({ ativo: true }),
    ]);
    return {
      rows: pagina.items.map(toTipoRowDto),
      filtrados: pagina.total,
      total,
      ativos,
      totalPages: pageCountOf(pagina.total, size),
    };
  }
}
