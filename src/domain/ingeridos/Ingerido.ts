export const DB_BADGES = [
  'tv',
  'digital',
  'pdv',
  'campo',
  'medico',
  'preco',
  'conc',
  'sazo',
  'supply',
  'canal',
  'reg',
  'viral',
  'macro',
  'outro',
] as const;

export type DbBadge = (typeof DB_BADGES)[number];

export const INGERIDO_TONES = [
  'blue',
  'teal',
  'red',
  'green',
  'purple',
  'orange',
  'yellow',
  'muted',
] as const;

export type IngeridoTone = (typeof INGERIDO_TONES)[number];

export interface Ingerido {
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

export interface IngeridoFiltro {
  q: string;
  categoria: string;
}

export const INGERIDO_FILTRO_VAZIO: IngeridoFiltro = { q: '', categoria: '' };

export interface IngeridoPageRequest {
  page: number;
  size: number;
}
