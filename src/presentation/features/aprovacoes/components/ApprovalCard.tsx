import type { AprovacaoCardDto } from '@application/aprovacoes/dto';
import { Badge } from '@presentation/components/ui';
import type { ReactNode } from 'react';
import { ApprovalCardActions } from './ApprovalCardActions';
import { BORDER_DECIDIDO, TEXT_TONE } from './aprovTones';

interface ApprovalCardProps {
  card: AprovacaoCardDto;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onReabrir: (id: string) => void;
}

function Campo({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div>
      <div className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.06em] text-apsen-muted">
        {label}
      </div>
      <div className={`text-[13px] font-medium leading-[1.5] text-apsen-slate ${className}`.trim()}>
        {children}
      </div>
    </div>
  );
}

export function ApprovalCard({ card, ...acoes }: ApprovalCardProps) {
  return (
    <li
      aria-label={card.id}
      className={`mb-[14px] list-none rounded-apsen-lg border border-apsen-border bg-apsen-white px-[20px] py-[18px] transition-[border] hover:border-apsen-blue-light ${BORDER_DECIDIDO[card.status] ?? ''}`.trim()}
    >
      <div className="mb-[14px] flex flex-wrap items-center gap-[10px]">
        <span className="font-mono text-[12.5px] font-bold text-apsen-blue">{card.id}</span>
        <Badge tone={card.modoTone}>{card.modoLabel}</Badge>
        <Badge tone={card.statusTone} data-status={card.status}>
          {card.statusLabel}
        </Badge>
        <span className="ml-auto text-[12px] text-apsen-muted">{card.meta}</span>
      </div>
      <div className="mb-[12px] grid grid-cols-[2fr_1fr_1fr_1fr] gap-[16px] max-[800px]:grid-cols-2">
        <Campo label="Produto / Molécula">
          {card.produto}
          <br />
          <span className="text-[11px] text-apsen-muted">{card.molecula}</span>
        </Campo>
        <Campo label="Tipo de Driver" className="text-[12.5px]">
          {card.tipo}
        </Campo>
        <Campo label="Período">{card.periodo}</Campo>
        <Campo label="Intensidade" className={`font-semibold ${TEXT_TONE[card.intensidadeTone]}`}>
          {card.intensidadeLabel}
        </Campo>
      </div>
      <div className="mb-[13px] rounded-r-[6px] border-l-[3px] border-apsen-border bg-apsen-bg px-[13px] py-[9px] text-[12.5px] leading-[1.65] text-apsen-slate-3">
        <strong>Parâmetros:</strong> {card.params}
      </div>
      {card.decisao === '' ? null : (
        <p className="mb-[10px] text-[12px] text-apsen-muted">{card.decisao}</p>
      )}
      <ApprovalCardActions card={card} {...acoes} />
    </li>
  );
}
