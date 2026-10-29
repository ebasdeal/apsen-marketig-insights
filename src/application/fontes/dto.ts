import type { FonteAuth, FonteModo } from '@domain/fontes/Fonte';

export interface FonteConfigDto {
  modo: FonteModo;
  url: string;
  auth: FonteAuth;
  cache: number;
  mapValor: string;
  mapLabel: string;
}

export interface FonteCardDto {
  id: string;
  nome: string;
  icon: string;
  desc: string;
  isApi: boolean;
  statusLabel: string;
  apiLine: string | null;
  removivel: boolean;
  config: FonteConfigDto;
}

export interface FontesPageDto {
  items: FonteCardDto[];
  total: number;
  totalPages: number;
}

export interface FonteOptionDto {
  value: string;
  label: string;
}

export interface FonteToastResult {
  toast: string;
}
