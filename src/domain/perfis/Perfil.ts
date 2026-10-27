export type PerfilId = 'admin' | 'planejador' | 'area' | 'viewer';

export type NivelAcesso = 1 | 2 | 3 | 4;

export type PerfilTone = 'purple' | 'blue' | 'teal' | 'muted';

export interface Perfil {
  id: PerfilId;
  nivel: NivelAcesso;
  label: string;
  tone: PerfilTone;
  avatar: string;
  usuario: string;
  hint: string;
}

export const PERFIL_INICIAL: PerfilId = 'admin';

export function ordenarPorNivel<T extends { nivel: NivelAcesso }>(perfis: readonly T[]): T[] {
  return [...perfis].sort((a, b) => b.nivel - a.nivel);
}
