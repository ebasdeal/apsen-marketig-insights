import type { FonteAuth } from './Fonte';

export interface Opcao<V extends string = string> {
  value: V;
  label: string;
}

export const FONTE_ICONES: readonly Opcao[] = [
  { value: '🔌', label: '🔌 Genérico' },
  { value: '🏁', label: '🏁 Concorrência' },
  { value: '🏭', label: '🏭 Laboratório' },
  { value: '💊', label: '💊 Molécula / Produto' },
  { value: '💲', label: '💲 Preço / Financeiro' },
  { value: '🏥', label: '🏥 Cliente / PDV' },
  { value: '🚚', label: '🚚 Distribuidor / Logística' },
  { value: '📊', label: '📊 Mercado / Share' },
  { value: '🏛️', label: '🏛️ Regulatório' },
];

export const FONTE_AUTH: readonly Opcao<FonteAuth>[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'apikey', label: 'API Key (header)' },
  { value: 'bearer', label: 'Bearer Token / OAuth2' },
  { value: 'basic', label: 'Basic Auth' },
];

export const MAP_PADRAO = { valor: 'nome', label: 'razao_social' } as const;

export const ICONE_PADRAO = '🔌';

export const DESC_PADRAO = 'Fonte de dados personalizada.';

export const CAMPOS_PADRAO = '—';

export const CACHE_PADRAO = 60;
