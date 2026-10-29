import type { Categoria } from './lookups';

export type DriverBadgeTone =
  'tv' | 'pdv' | 'supply' | 'canal' | 'conc' | 'reg' | 'sazo' | 'viral' | 'macro' | 'outro';

export interface DriverBadge {
  label: string;
  tone: DriverBadgeTone;
}

const TONS: Readonly<Record<string, DriverBadgeTone>> = {
  midia: 'tv',
  comercial: 'pdv',
  produto: 'supply',
  supply: 'supply',
  logistica: 'canal',
  concorrencia: 'conc',
  regulatorio: 'reg',
  sazo: 'sazo',
  social: 'viral',
  macro: 'macro',
};

export function tomPorCategoria(slug: string | undefined): DriverBadgeTone {
  return slug === undefined ? 'outro' : (TONS[slug] ?? 'outro');
}

export function categoriaDoTipo(
  tipo: string,
  categorias: readonly Categoria[],
): Categoria | undefined {
  return categorias.find((categoria) => categoria.tipos.some((item) => item.slug === tipo));
}

export function badgeDoTipo(
  tipo: string,
  categorias: readonly Categoria[],
  labels: Readonly<Record<string, string>>,
): DriverBadge {
  return {
    label: labels[tipo] ?? tipo,
    tone: tomPorCategoria(categoriaDoTipo(tipo, categorias)?.slug),
  };
}
