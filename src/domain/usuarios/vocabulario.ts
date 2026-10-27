import type { PerfilId } from '../perfis/Perfil';

export type PerfilBadgeTone = 'purple' | 'blue' | 'teal' | 'gray';

export interface UsuarioOpcao<T extends string> {
  value: T;
  label: string;
}

export const USUARIO_AREAS: readonly string[] = [
  'S&OP / Planejamento',
  'Marketing',
  'Comercial & Trade',
  'Força de Vendas',
  'Supply & PCP',
  'Regulatório',
  'Inteligência Competitiva',
  'Financeiro',
];

export const USUARIO_PERFIS: readonly UsuarioOpcao<PerfilId>[] = [
  { value: 'admin', label: '⚙️ Admin' },
  { value: 'planejador', label: '📋 Planejador' },
  { value: 'area', label: '🏢 Área (usuário)' },
  { value: 'viewer', label: '👁 Visualizador' },
];

export const USUARIO_FILTRO_PERFIS: readonly UsuarioOpcao<PerfilId | ''>[] = [
  { value: '', label: 'Todos os perfis' },
  { value: 'admin', label: 'Admin' },
  { value: 'planejador', label: 'Planejador' },
  { value: 'area', label: 'Área (usuário)' },
  { value: 'viewer', label: 'Visualizador' },
];

export const PERFIL_BADGE_TONE: Record<PerfilId, PerfilBadgeTone> = {
  admin: 'purple',
  planejador: 'blue',
  area: 'teal',
  viewer: 'gray',
};

export const USUARIO_PAGE_SIZE = 10;
