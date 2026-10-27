import type { Route } from 'next';

export const HOME_ROUTE = '/' satisfies Route;

export const ACCESS_DENIED_ROUTE = '/acesso-negado' satisfies Route;

export const AUTH_CALLBACK_ROUTE = '/auth/callback' satisfies Route;

export const TIPOS_ROUTE = '/admin/tipos' as Route;

export const TIPO_NOVO_ROUTE = '/admin/tipos/novo' as Route;

export function tipoEditarRoute(id: string): Route {
  return `/admin/tipos/${encodeURIComponent(id)}/editar` as Route;
}
