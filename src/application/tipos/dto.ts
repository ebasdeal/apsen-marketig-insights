import type { CamposTipo, CategoriaSlug, TipoDraft } from '@domain/tipos/Tipo';
import type { CodeTone } from '@domain/tipos/vocabulario';

export interface TipoRowDto {
  id: string;
  slug: string;
  label: string;
  catL: string;
  dono: string;
  feature: string;
  featureTone: CodeTone;
  lagTxt: string;
  params: number;
  ativo: boolean;
}

export interface ListTiposInput {
  page: number;
  size: number;
  cat?: CategoriaSlug;
}

export interface ListTiposResult {
  rows: TipoRowDto[];
  filtrados: number;
  total: number;
  ativos: number;
  totalPages: number;
}

export interface TipoFormDto {
  draft: TipoDraft;
  campos: CamposTipo | null;
  featureExtra: string | null;
}

export type SaveTipoInput =
  { modo: 'novo'; draft: TipoDraft } | { modo: 'editar'; id: string; draft: TipoDraft };

export interface TipoRefInput {
  id: string;
  slug: string;
}

export interface ToggleTipoInput extends TipoRefInput {
  ativo: boolean;
}

export interface ToastDto {
  toast: string;
}

export interface ImportCatalogoResult extends ToastDto {
  inseridos: number;
  atualizados: number;
}
