import type { Route } from 'next';

export const DRIVERS_ROUTE = '/drivers' satisfies Route;

export const NOVO_DRIVER_ROUTE = '/drivers/novo' satisfies Route;

export const EXPORTAR_ROUTE = '/drivers/exportar' satisfies Route;

export const CATALOGO_ROUTE = '/drivers/catalogo' satisfies Route;

function comFamilia(path: string, familia: string | undefined): Route {
  const query =
    familia === undefined || familia === '' ? '' : `?familia=${encodeURIComponent(familia)}`;
  return `${path}${query}` as Route;
}

export function novoDriverRoute(familia?: string): Route {
  return comFamilia(NOVO_DRIVER_ROUTE, familia);
}

export function driverRoute(id: string, familia?: string): Route {
  return comFamilia(`/drivers/${encodeURIComponent(id)}`, familia);
}

export function editarDriverRoute(id: string, familia?: string): Route {
  return comFamilia(`/drivers/${encodeURIComponent(id)}/editar`, familia);
}

export function catalogoFamiliaRoute(familia: string): Route {
  return `/drivers/catalogo/${encodeURIComponent(familia)}` as Route;
}

export function voltarRoute(familia: string | undefined): Route {
  return familia === undefined || familia === '' ? DRIVERS_ROUTE : catalogoFamiliaRoute(familia);
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first === undefined || first === '' ? undefined : first;
}
