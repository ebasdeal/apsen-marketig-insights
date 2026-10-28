import type { Route } from 'next';

export const HOME_ROUTE = '/' satisfies Route;

export const ACCESS_DENIED_ROUTE = '/acesso-negado' satisfies Route;

export const AUTH_CALLBACK_ROUTE = '/auth/callback' satisfies Route;

export const ANALISES_ROUTE = '/analises' satisfies Route;

export const NOVA_ANALISE_ROUTE = '/analises/nova' satisfies Route;

export function analiseRoute(id: string): Route {
  return `/analises/${encodeURIComponent(id)}` as Route;
}

export const RELATORIOS_ROUTE = '/relatorios' satisfies Route;
