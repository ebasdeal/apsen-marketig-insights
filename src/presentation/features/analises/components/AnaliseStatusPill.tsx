import type { AnaliseStatus } from '@domain/analises/Analise';
import { ANALISE_STATUS_LABEL } from '@domain/analises/analiseConstants';

const TONS: Record<AnaliseStatus, string> = {
  rascunho: 'border-apsen-border bg-apsen-bg text-apsen-muted',
  salva: 'border-apsen-green-b bg-apsen-green-bg text-apsen-green-fg',
  relatorio: 'border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue',
};

const TAMANHOS = {
  sm: 'px-[9px] py-[2px] text-[11px]',
  lg: 'px-[12px] py-[4px] text-[12px]',
};

interface AnaliseStatusPillProps {
  status: AnaliseStatus;
  size?: keyof typeof TAMANHOS;
}

export function AnaliseStatusPill({ status, size = 'sm' }: AnaliseStatusPillProps) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-[20px] border font-semibold ${TAMANHOS[size]} ${TONS[status]}`}
    >
      {ANALISE_STATUS_LABEL[status]}
    </span>
  );
}
