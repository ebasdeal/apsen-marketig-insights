import type { DbBadge, Ingerido, IngeridoFiltro, IngeridoTone } from '@domain/ingeridos/Ingerido';

export interface IngeridoRowDto {
  id: string;
  produto: string;
  sku: string;
  tipo: string;
  badge: DbBadge;
  periodo: string;
  feature: string;
  featureTone: IngeridoTone;
  area: string;
  validadoPor: string;
  categoria: string;
  idTone: IngeridoTone;
}

export interface ListIngeridosInput {
  filtro: IngeridoFiltro;
  page: number;
}

export interface ListIngeridosResult {
  rows: IngeridoRowDto[];
  total: number;
  totalPages: number;
  resumo: string;
}

export interface ToastDto {
  toast: string;
}

export function toIngeridoRowDto(item: Ingerido): IngeridoRowDto {
  return { ...item };
}
