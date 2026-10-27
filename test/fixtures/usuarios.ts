import type { PermissoesMatrizDto } from '@application/permissoes/ListPermissoes';
import { montarUsuariosPage, toUsuarioRowDto } from '@application/usuarios/ListUsuarios';
import type { UsuarioFormDto, UsuariosPageDto } from '@application/usuarios/dto';
import type { Permissao } from '@domain/permissoes/Permissao';
import { agruparPermissoes, celula } from '@domain/permissoes/permissaoRules';
import type { Usuario } from '@domain/usuarios/Usuario';

export const USUARIOS_FIXTURE: Usuario[] = [
  {
    id: '1',
    nome: 'Ana Admin',
    email: 'ana.admin@apsen.com.br',
    perfil: 'admin',
    perfilLabel: 'Admin',
    area: 'S&OP',
    podeRegistrar: true,
    podeValidar: true,
    admin: true,
    ultimoAcesso: 'Hoje 14:32',
    ativo: true,
    removivel: false,
    categorias: [],
  },
  {
    id: '2',
    nome: 'Carlos Planejador',
    email: 'carlos.lima@apsen.com.br',
    perfil: 'planejador',
    perfilLabel: 'Planejador',
    area: 'S&OP',
    podeRegistrar: true,
    podeValidar: true,
    admin: false,
    ultimoAcesso: '19/06/2026',
    ativo: true,
    removivel: true,
    categorias: [],
  },
  {
    id: '3',
    nome: 'Fernanda Marketing',
    email: 'fernanda.mkt@apsen.com.br',
    perfil: 'area',
    perfilLabel: 'Área',
    area: 'Marketing',
    podeRegistrar: true,
    podeValidar: false,
    admin: false,
    ultimoAcesso: '18/06/2026',
    ativo: true,
    removivel: true,
    categorias: [],
  },
  {
    id: '4',
    nome: 'Pedro Viewer',
    email: 'pedro.viewer@apsen.com.br',
    perfil: 'viewer',
    perfilLabel: 'Visualizador',
    area: 'Financeiro',
    podeRegistrar: false,
    podeValidar: false,
    admin: false,
    ultimoAcesso: '15/06/2026',
    ativo: false,
    removivel: true,
    categorias: [],
  },
];

export function buildUsuario(overrides: Partial<Usuario> = {}): Usuario {
  return { ...(USUARIOS_FIXTURE[2] as Usuario), ...overrides };
}

export const USUARIOS_PAGE_FIXTURE: UsuariosPageDto = montarUsuariosPage(
  USUARIOS_FIXTURE.map(toUsuarioRowDto),
  USUARIOS_FIXTURE.length,
  10,
);

export const USUARIO_FORM_FIXTURE: UsuarioFormDto = {
  draft: {
    nome: 'Fernanda Marketing',
    email: 'fernanda.mkt@apsen.com.br',
    area: 'Marketing',
    perfil: 'area',
    categorias: ['midia', 'comercial'],
    ativo: true,
  },
  areaExtra: null,
};

const LINHA = { viewer: '—', area: '—', planejador: '✓', admin: '✓' };

export const PERMISSOES_FIXTURE: Permissao[] = [
  {
    id: '1',
    grupo: 'Drivers de Demanda',
    funcionalidade: 'Ver drivers ingeridos',
    ...LINHA,
    viewer: '✓',
    area: '✓',
  },
  {
    id: '2',
    grupo: 'Drivers de Demanda',
    funcionalidade: 'Registrar novo driver',
    ...LINHA,
    area: '✓ (só suas cat.)',
  },
  { id: '3', grupo: 'Drivers de Demanda', funcionalidade: 'Editar / remover driver', ...LINHA },
  { id: '4', grupo: 'Drivers de Demanda', funcionalidade: 'Exportar JSON', ...LINHA },
  { id: '5', grupo: 'Administração DI', funcionalidade: 'Ver catálogo de tipos', ...LINHA },
  {
    id: '6',
    grupo: 'Administração DI',
    funcionalidade: 'Criar / editar tipos',
    ...LINHA,
    planejador: '—',
  },
  {
    id: '7',
    grupo: 'Administração DI',
    funcionalidade: 'Ativar / inativar tipos',
    ...LINHA,
    planejador: '—',
  },
  { id: '8', grupo: 'Administração DI', funcionalidade: 'Ver drivers ingeridos', ...LINHA },
  {
    id: '9',
    grupo: 'Administração DI',
    funcionalidade: 'Remover da ingestão',
    ...LINHA,
    planejador: '—',
  },
  {
    id: '10',
    grupo: 'Controle de Acesso',
    funcionalidade: 'Criar / editar usuários',
    ...LINHA,
    planejador: '—',
  },
  { id: '11', grupo: 'Controle de Acesso', funcionalidade: 'Ver perfis de acesso', ...LINHA },
];

export const PERMISSOES_MATRIZ_FIXTURE: PermissoesMatrizDto = {
  grupos: agruparPermissoes(PERMISSOES_FIXTURE).map(({ grupo, permissoes }) => ({
    grupo,
    linhas: permissoes.map((permissao) => ({
      id: permissao.id,
      funcionalidade: permissao.funcionalidade,
      celulas: {
        viewer: celula(permissao.viewer),
        area: celula(permissao.area),
        planejador: celula(permissao.planejador),
        admin: celula(permissao.admin),
      },
    })),
  })),
};
