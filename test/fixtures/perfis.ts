import type { PerfilDto } from '@application/perfis/dto';

export const PERFIS_FIXTURE: PerfilDto[] = [
  {
    id: 'admin',
    nivel: 4,
    label: 'Admin',
    tone: 'purple',
    avatar: 'A',
    usuario: 'Ana Admin',
    hint: 'Acesso total: configura tipos, usuários e exporta dados para o modelo.',
  },
  {
    id: 'planejador',
    nivel: 3,
    label: 'Planejador',
    tone: 'blue',
    avatar: 'C',
    usuario: 'Carlos Planejador',
    hint: 'Revisa e valida drivers. Acessa catálogo e drivers ingeridos. Pode exportar JSON.',
  },
  {
    id: 'area',
    nivel: 2,
    label: 'Área',
    tone: 'teal',
    avatar: 'F',
    usuario: 'Fernanda Marketing',
    hint: 'Registra drivers apenas das categorias autorizadas. Não acessa admin nem exportação.',
  },
  {
    id: 'viewer',
    nivel: 1,
    label: 'Visualizador',
    tone: 'muted',
    avatar: 'P',
    usuario: 'Pedro Viewer',
    hint: 'Somente visualiza drivers ingeridos e a lista de tipos. Sem edição ou registro.',
  },
];

export function buildPerfil(overrides: Partial<PerfilDto> = {}): PerfilDto {
  return { ...(PERFIS_FIXTURE[0] as PerfilDto), ...overrides };
}
