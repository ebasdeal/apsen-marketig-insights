import type { Route } from 'next';

export const HOME_ROUTE = '/' satisfies Route;

export const ACCESS_DENIED_ROUTE = '/acesso-negado' satisfies Route;

export const AUTH_CALLBACK_ROUTE = '/auth/callback' satisfies Route;

export const TIPOS_ROUTE = '/admin/tipos' as Route;

export const TIPO_NOVO_ROUTE = '/admin/tipos/novo' as Route;

export function tipoEditarRoute(id: string): Route {
  return `/admin/tipos/${encodeURIComponent(id)}/editar` as Route;
}
export const ANALISES_ROUTE = '/analises' satisfies Route;
export const NOVA_ANALISE_ROUTE = '/analises/nova' satisfies Route;
export function analiseRoute(id: string): Route {
  return `/analises/${encodeURIComponent(id)}` as Route;
export const RELATORIOS_ROUTE = '/relatorios' satisfies Route;
export const USUARIOS_ROUTE = '/acesso/usuarios' satisfies Route;
export const USUARIO_NOVO_ROUTE = '/acesso/usuarios/novo' satisfies Route;
export const usuarioEditarRoute = (id: string) =>
  `/acesso/usuarios/${encodeURIComponent(id)}/editar` as Route;
export const PERFIS_ROUTE = '/acesso/perfis' satisfies Route;
export const AGENTES_ROUTE = '/agentes' satisfies Route;
export const AGENTE_NOVO_ROUTE = '/agentes/novo' satisfies Route;
export const agenteEditarRoute = (id: string) =>
  `/agentes/${encodeURIComponent(id)}/editar` as Route;
