import type { Severidade } from '@domain/restricoes/Restricao';

export const IMPACTO_COR: Record<Severidade, string> = {
  critica: 'text-apsen-red',
  atencao: 'text-apsen-attention',
  analise: 'text-apsen-blue',
};

export const SEVERIDADE_PILL: Record<Severidade, string> = {
  critica: 'border-apsen-danger-b-soft bg-apsen-kpi-red text-apsen-red',
  atencao: 'border-apsen-cat-pdv-b bg-apsen-cat-pdv-bg text-apsen-attention',
  analise: 'border-apsen-blue-soft-b bg-apsen-blue-bg text-apsen-blue',
};

export function prazoCor(sev: Severidade): string {
  return sev === 'critica' ? 'text-apsen-red' : 'text-apsen-slate';
}
