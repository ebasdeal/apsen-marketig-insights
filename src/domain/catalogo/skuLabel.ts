import type { Sku } from './Produto';

export function tagDoSku(sku: Pick<Sku, 'familia' | 'franquia'>): string {
  return `${sku.familia} (${sku.franquia})`;
}
