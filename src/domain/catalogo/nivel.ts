import type { Granularidade } from '../drivers/Driver';

export interface NivelDriver {
  label: 'SKU' | 'Franquia' | 'Família';
  tone: 'sku' | 'franquia' | 'familia';
}

const NIVEIS: Record<Granularidade, NivelDriver> = {
  sku: { label: 'SKU', tone: 'sku' },
  franquia: { label: 'Franquia', tone: 'franquia' },
  familia: { label: 'Família', tone: 'familia' },
};

export function nivelDoDriver(modo: Granularidade): NivelDriver {
  return NIVEIS[modo];
}
