import type { Franquia } from './Produto';

export interface FiltrosCatalogo {
  busca: string;
  franquia: string;
  familia: string;
}

export interface GrupoFamilias {
  franquia: string;
  familias: string[];
}

function ordenar(valores: readonly string[]): string[] {
  return [...valores].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function opcoesFranquia(franquias: readonly Franquia[]): string[] {
  return ordenar(franquias.map((franquia) => franquia.id));
}

export function familiasPorFranquia(franquias: readonly Franquia[]): Record<string, string[]> {
  return Object.fromEntries(
    opcoesFranquia(franquias).map((id) => [
      id,
      ordenar(franquias.find((franquia) => franquia.id === id)?.familias ?? []),
    ]),
  );
}

export function opcoesFamilia(
  franquias: readonly Franquia[],
  franquia: string,
): GrupoFamilias[] | string[] {
  const porFranquia = familiasPorFranquia(franquias);
  if (franquia !== '') {
    return porFranquia[franquia] ?? [];
  }
  return Object.entries(porFranquia).map(([id, familias]) => ({ franquia: id, familias }));
}

export function aplicarFranquia(
  filtros: FiltrosCatalogo,
  franquia: string,
  franquias: readonly Franquia[],
): FiltrosCatalogo {
  const familias = franquias.find((candidata) => candidata.id === franquia)?.familias ?? [];
  const manterFamilia = franquia === '' || familias.includes(filtros.familia);
  return { ...filtros, franquia, familia: manterFamilia ? filtros.familia : '' };
}

export function normalizarBusca(texto: string): string {
  return texto.trim();
}
