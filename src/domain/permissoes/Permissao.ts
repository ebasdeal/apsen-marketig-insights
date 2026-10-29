import type { PerfilId } from '../perfis/Perfil';

export interface Permissao {
  id: string;
  grupo: string;
  funcionalidade: string;
  viewer: string;
  area: string;
  planejador: string;
  admin: string;
}

export const PERFIS_DA_MATRIZ: readonly PerfilId[] = ['viewer', 'area', 'planejador', 'admin'];
