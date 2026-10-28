import type { PlanoStatus } from '@domain/planos/PlanoItem';
import type { PillColor } from '@presentation/components/ui';

export const STATUS_COR: Record<PlanoStatus, string> = {
  aprovado: 'text-apsen-green',
  revisao: 'text-apsen-orange',
  bloqueado: 'text-apsen-red',
  pendente: 'text-apsen-muted',
};

const FAMILIA_TOM: Record<string, PillColor> = {
  Imunologia: 'purple',
  Cardio: 'blue',
  Neurologia: 'blue',
  Dermatologia: 'amber',
  Reumatologia: 'emerald',
  Endocrinologia: 'cyan',
  Gastro: 'lime',
};

export function tomDaFamilia(familia: string): PillColor {
  return FAMILIA_TOM[familia] ?? 'slate';
}
