import type { Route } from 'next';

export const HOME_ROUTE = '/' satisfies Route;

export const ACCESS_DENIED_ROUTE = '/acesso-negado' satisfies Route;

export const AUTH_CALLBACK_ROUTE = '/auth/callback' satisfies Route;

export const USUARIOS_ROUTE = '/acesso/usuarios' satisfies Route;
export const USUARIO_NOVO_ROUTE = '/acesso/usuarios/novo' satisfies Route;
export const usuarioEditarRoute = (id: string) =>
  `/acesso/usuarios/${encodeURIComponent(id)}/editar` as Route;
export const PERFIS_ROUTE = '/acesso/perfis' satisfies Route;
export const AGENTES_ROUTE = '/agentes' satisfies Route;
export const AGENTE_NOVO_ROUTE = '/agentes/novo' satisfies Route;
export const agenteEditarRoute = (id: string) =>
  `/agentes/${encodeURIComponent(id)}/editar` as Route;
