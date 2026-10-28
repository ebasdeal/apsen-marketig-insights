import type { Sessao } from '@domain/auth/Sessao';
import type { PerfilId } from '@domain/perfis/Perfil';

export const SESSOES: Record<PerfilId, Sessao> = {
  admin: {
    token: 'tok-admin',
    usuario: {
      id: '1',
      nome: 'Ana Admin',
      email: 'ana.admin@apsen.com.br',
      perfil: 'admin',
      perfilLabel: 'Admin',
      area: 'S&OP',
      ativo: true,
    },
  },
  planejador: {
    token: 'tok-planejador',
    usuario: {
      id: '2',
      nome: 'Carlos Planejador',
      email: 'carlos.lima@apsen.com.br',
      perfil: 'planejador',
      perfilLabel: 'Planejador',
      area: 'S&OP',
      ativo: true,
    },
  },
  area: {
    token: 'tok-area',
    usuario: {
      id: '3',
      nome: 'Fernanda Marketing',
      email: 'fernanda.mkt@apsen.com.br',
      perfil: 'area',
      perfilLabel: 'Área',
      area: 'Marketing',
      ativo: true,
    },
  },
  viewer: {
    token: 'tok-viewer',
    usuario: {
      id: '4',
      nome: 'Pedro Viewer',
      email: 'pedro.viewer@apsen.com.br',
      perfil: 'viewer',
      perfilLabel: 'Visualizador',
      area: 'Financeiro',
      ativo: true,
    },
  },
};

export const SESSAO_ADMIN = SESSOES.admin;
