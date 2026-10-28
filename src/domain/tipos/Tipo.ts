export const CATEGORIA_SLUGS = [
  'midia',
  'comercial',
  'produto',
  'supply',
  'logistica',
  'concorrencia',
  'regulatorio',
  'sazo',
  'social',
  'macro',
] as const;

export type CategoriaSlug = (typeof CATEGORIA_SLUGS)[number];

export function isCategoriaSlug(value: unknown): value is CategoriaSlug {
  return typeof value === 'string' && (CATEGORIA_SLUGS as readonly string[]).includes(value);
}

export interface Tipo {
  id: string;
  slug: string;
  label: string;
  cat: CategoriaSlug;
  catL: string;
  dono: string;
  feature: string;
  lag: number;
  params: number;
  ativo: boolean;
  desc: string;
  impacto: string;
  perm: string;
  nota: string;
  alteradoPor: string;
  alteradoEm: string;
}

export type TipoPatch = Partial<Omit<Tipo, 'id' | 'slug'>>;

export interface CategoriaTipoRef {
  slug: string;
  label: string;
}

export interface Categoria {
  id: number;
  label: string;
  slug: CategoriaSlug;
  labelTipoForm: string;
  tipos: CategoriaTipoRef[];
}

export const PARAM_TIPOS_TODOS = ['select', 'text', 'number', 'date', 'autocomplete'] as const;

export type ParamTipo = (typeof PARAM_TIPOS_TODOS)[number];

export function isParamTipo(value: unknown): value is ParamTipo {
  return typeof value === 'string' && (PARAM_TIPOS_TODOS as readonly string[]).includes(value);
}

export type OpcaoCampo = string | { label: string; group: string };

export interface CampoTipo {
  [atributo: string]: unknown;
  label: string;
  required: boolean;
  id: string;
  param: string;
  type: ParamTipo;
  options?: OpcaoCampo[];
  placeholder?: string;
  step?: string | number;
  readonly?: boolean;
  autocomplete?: 'labs' | 'marcas';
  labelHint?: string;
  fonte?: string;
}

export type CamposLayout = 'g2' | 'g3';

export interface CamposTipo {
  id: string;
  title: string;
  layout: CamposLayout;
  campos: CampoTipo[];
}

export type ParamOrigem = 'fixas' | 'api';

export interface ParamRow {
  key: string;
  nome: string;
  label: string;
  tipo: ParamTipo;
  obrigatorio: boolean;
  origem: ParamOrigem;
  opcoes: string;
  fonte: string;
  original?: CampoTipo;
}

export interface TipoDraft {
  slug: string;
  label: string;
  cat: CategoriaSlug | '';
  dono: string;
  desc: string;
  feature: string;
  lag: string;
  impacto: string;
  perm: string;
  nota: string;
  ativo: boolean;
  rows: ParamRow[];
}

export interface TipoPageRequest {
  page: number;
  size: number;
  cat?: CategoriaSlug;
}
