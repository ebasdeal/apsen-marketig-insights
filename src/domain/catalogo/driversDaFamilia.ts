import type { Driver } from '../drivers/Driver';

function semCodigo(nome: string): string {
  return (nome.split('(')[0] ?? '').trim();
}

function casaPorCodigo(codigo: string, skus: readonly string[]): boolean {
  return codigo !== '' && skus.some((sku) => sku.includes(codigo) || codigo.includes(sku));
}

function casaPorProduto(produto: string, skus: readonly string[]): boolean {
  if (produto === '') {
    return false;
  }
  const base = semCodigo(produto);
  return skus.some((sku) => sku.includes(base) || base.includes(semCodigo(sku)));
}

export function pertenceAFamilia(
  driver: Driver,
  franquia: string,
  familia: string,
  skus: readonly string[],
): boolean {
  return (
    driver.molecula === familia ||
    (driver.modo === 'franquia' && driver.molecula === franquia) ||
    casaPorCodigo(driver.codigo, skus) ||
    casaPorProduto(driver.produto, skus)
  );
}

export function driversDaFamilia(
  drivers: readonly Driver[],
  franquia: string,
  familia: string,
  skus: readonly string[],
): Driver[] {
  return drivers.filter((driver) => pertenceAFamilia(driver, franquia, familia, skus));
}

export function contarDrivers(
  drivers: readonly Driver[],
  franquia: string,
  familia: string,
  skus: readonly string[],
): number {
  return driversDaFamilia(drivers, franquia, familia, skus).length;
}
