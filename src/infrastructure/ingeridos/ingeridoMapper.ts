import type { Ingerido, IngeridoFiltro } from '@domain/ingeridos/Ingerido';
import { badgeVariant, cssVarTone } from '@domain/ingeridos/ingeridoRules';
import type { QueryParams } from '../http/HttpClient';
import type { IngeridoApiDto } from './ingeridoSchema';

export function toIngerido(dto: IngeridoApiDto): Ingerido {
  return {
    id: dto.id,
    produto: dto.produto,
    sku: dto.sku,
    tipo: dto.tipo,
    badge: badgeVariant(dto.badge),
    periodo: dto.periodo,
    feature: dto.feature,
    featureTone: cssVarTone(dto.featureCor),
    area: dto.area,
    validadoPor: dto.validadoPor,
    categoria: dto.categoria,
    idTone: cssVarTone(dto.idCor),
  };
}

export function toIngeridoQuery(filtro: IngeridoFiltro): QueryParams {
  const query: QueryParams = {};
  const q = filtro.q.trim();
  if (q !== '') {
    query.q = q;
  }
  if (filtro.categoria !== '') {
    query.categoria = filtro.categoria;
  }
  return query;
}
