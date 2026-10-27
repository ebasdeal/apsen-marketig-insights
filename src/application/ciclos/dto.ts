import type { CicloDraft, CicloStatus } from '@domain/ciclos/Ciclo';

export interface CicloRowDto {
  id: string;
  codigo: string;
  descricao: string;
  meta: string;
  periodo: string;
  drivers: number;
  responsavel: string;
  status: CicloStatus;
  inicio: string;
  fim: string;
}

export interface CiclosPageDto {
  rows: CicloRowDto[];
  total: number;
  totalPages: number;
}

export interface CicloAtivoDto {
  id: string;
  codigo: string;
  mesAno: string;
}

export interface CiclosResumoDto {
  total: number;
  ativos: number;
  ativo: CicloAtivoDto | null;
  proximoCodigo: string;
  proximoPeriodo: { inicio: string; fim: string };
}

export interface SaveCicloInput {
  modo: 'novo' | 'editar';
  id?: string;
  draft: CicloDraft;
}

export interface ToggleCicloInput {
  id: string;
  ativo: boolean;
}

export interface ToastResult {
  toast: string;
}

export interface ToggleCicloResult extends ToastResult {
  encerradoId: string | null;
}
