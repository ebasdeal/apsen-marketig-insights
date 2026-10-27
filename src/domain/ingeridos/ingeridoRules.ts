import { DB_BADGES, INGERIDO_TONES, type DbBadge, type IngeridoTone } from './Ingerido';

const CSS_VAR = /^var\(--([a-z-]+)\)$/;

const BADGE_PREFIX = 'db-';

export const INGERIDOS_CATEGORIAS: readonly string[] = [
  'Regulatório',
  'Concorrência',
  'Supply',
  'Mídia',
];

export const INGERIDOS_PAGE_SIZE = 10;

export function cssVarTone(cor: string): IngeridoTone {
  const nome = CSS_VAR.exec(cor)?.[1];
  return INGERIDO_TONES.find((tone) => tone === nome) ?? 'muted';
}

export function badgeVariant(badge: string): DbBadge {
  const nome = badge.startsWith(BADGE_PREFIX) ? badge.slice(BADGE_PREFIX.length) : '';
  return DB_BADGES.find((variante) => variante === nome) ?? 'outro';
}

export function resumoIngeridos(n: number): string {
  return `${n} driver${n === 1 ? '' : 's'}`;
}
