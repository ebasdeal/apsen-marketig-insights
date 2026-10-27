import type { Familia, Franquia, Sku } from '@domain/catalogo/Produto';
import type { DriverBadge } from '@domain/drivers/badgeTone';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverDraft } from '@domain/drivers/draft';
import type {
  CampoTipo,
  CamposTipo,
  Categoria,
  DriverConfig,
  IntensidadeInfo,
} from '@domain/drivers/lookups';
import type { ParametroResumo } from '@domain/drivers/resumoDriver';

export interface DriverFormLookupsDto {
  categorias: Categoria[];
  tiposAtivos: string[];
  camposPorTipo: Record<string, CamposTipo>;
  intensidades: IntensidadeInfo[];
  config: DriverConfig;
  franquias: Franquia[];
}

export interface DriverForFormDto {
  driver: Driver;
  sku: Sku | null;
  familia: Familia | null;
}

export interface CreateDriverInput {
  draft: DriverDraft;
  campos: readonly CampoTipo[];
}

export interface UpdateDriverInput extends CreateDriverInput {
  id: string;
  original: Driver;
}

export interface SearchMarcasInput {
  laboratorio: string;
  termo: string;
}

export interface DriversPageRequest {
  page: number;
  size: number;
}

export interface DriverListItemDto {
  id: string;
  badge: DriverBadge;
  titulo: string;
  periodo: string;
  estrelas: string;
  verba: number | null;
  canais: string[];
  parametros: ParametroResumo[];
  observacoes: string;
}

export interface DriversPageDto {
  items: DriverListItemDto[];
  total: number;
  page: number;
  size: number;
}

export interface DriversExportDto {
  texto: string;
  nomeArquivo: string;
  total: number;
}
