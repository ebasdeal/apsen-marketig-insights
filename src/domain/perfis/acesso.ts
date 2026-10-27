import type { NivelAcesso } from './Perfil';

export type ModuloId =
  'drivers' | 'admin' | 'acesso' | 'agentes' | 'analises' | 'restricoes' | 'planos' | 'relatorios';

export type UpgradeNivel = 'area-ou-planejador' | 'planejador' | 'admin';

export const NIVEL_MINIMO_MODULO: Record<ModuloId, NivelAcesso> = {
  drivers: 2,
  admin: 3,
  acesso: 4,
  agentes: 4,
  analises: 2,
  restricoes: 3,
  planos: 1,
  relatorios: 1,
};

export const NIVEL_MINIMO_ITEM: Partial<Record<string, NivelAcesso>> = {
  export: 3,
  'user-form': 4,
};

const UPGRADE: Record<NivelAcesso, UpgradeNivel | null> = {
  1: 'area-ou-planejador',
  2: 'planejador',
  3: 'admin',
  4: null,
};

export function podeAcessar(nivel: NivelAcesso, minimo: NivelAcesso | null): boolean {
  return minimo === null || nivel >= minimo;
}

export function moduloVisivel(nivel: NivelAcesso, modulo: ModuloId): boolean {
  return podeAcessar(nivel, NIVEL_MINIMO_MODULO[modulo]);
}

export function itemVisivel(nivel: NivelAcesso, screenId: string): boolean {
  return podeAcessar(nivel, NIVEL_MINIMO_ITEM[screenId] ?? null);
}

export function upgradeNivel(nivel: NivelAcesso): UpgradeNivel | null {
  return UPGRADE[nivel];
}
