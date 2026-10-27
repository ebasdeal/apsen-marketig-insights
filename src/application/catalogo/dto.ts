import type { NivelDriver } from '@domain/catalogo/nivel';
import type { DriverBadge } from '@domain/drivers/badgeTone';

export interface CatalogRowDto {
  franquia: string;
  familia: string;
  nSkus: number;
  nDrivers: number;
}

export interface CatalogPageDto {
  rows: CatalogRowDto[];
  total: number;
  page: number;
  size: number;
}

export interface CatalogFiltersDto {
  franquias: string[];
  familiasPorFranquia: Record<string, string[]>;
}

export interface FamiliaDriverRowDto {
  id: string;
  badge: DriverBadge;
  titulo: string;
  produto: string;
  periodo: string;
  nivel: NivelDriver;
  intensidade: number;
  estrelas: string;
}

export interface FamiliaDriversDto {
  franquia: string;
  familia: string;
  drivers: FamiliaDriverRowDto[];
}
