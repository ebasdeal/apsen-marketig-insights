import type { Route } from 'next';

export const PLANOS_ROUTE = '/planos' satisfies Route;

export function planoItemRoute(id: string): Route {
  return `/planos/${encodeURIComponent(id)}` as Route;
}
