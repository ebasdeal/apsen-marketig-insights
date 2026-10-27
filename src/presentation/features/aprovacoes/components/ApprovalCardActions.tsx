'use client';

import type { AprovacaoCardDto } from '@application/aprovacoes/dto';
import { Button } from '@presentation/components/ui';
import { CheckIcon, CloseIcon } from '../../adminDi/adminIcons';
import { TEXT_TONE } from './aprovTones';

interface ApprovalCardActionsProps {
  card: AprovacaoCardDto;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onReabrir: (id: string) => void;
}

function Motivo({ card }: { card: AprovacaoCardDto }) {
  if (card.motivo === '') return null;
  const justificativa = card.justificativa === '' ? '' : ` — ${card.justificativa}`;
  return (
    <span className="ml-[8px] text-[11.5px] text-apsen-muted">
      Motivo: {card.motivo}
      {justificativa}
    </span>
  );
}

export function ApprovalCardActions({
  card,
  onAprovar,
  onRejeitar,
  onReabrir,
}: ApprovalCardActionsProps) {
  if (card.status === 'pendente') {
    return (
      <div className="flex items-center gap-[8px]">
        <Button
          variant="success"
          size="sm"
          aria-label={`Aprovar ${card.id}`}
          onClick={() => onAprovar(card.id)}
        >
          <CheckIcon />
          Aprovar
        </Button>
        <Button
          variant="danger"
          size="sm"
          aria-label={`Rejeitar ${card.id}`}
          onClick={() => onRejeitar(card.id)}
        >
          <CloseIcon />
          Rejeitar
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-y-[6px]">
      <span className={`text-[12px] font-semibold ${TEXT_TONE[card.statusTone]}`}>
        {card.statusLabel}
      </span>
      <Motivo card={card} />
      <span className="ml-[12px]">
        {card.emUso ? (
          <span className="inline-flex items-center gap-[4px] rounded-[10px] border border-apsen-border bg-apsen-bg px-[9px] py-[2px] text-[11px] font-semibold text-apsen-muted">
            🔒 Em uso no Data Lake — não pode alterar
          </span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            dashed
            className="text-[11.5px]"
            aria-label={`Alterar decisão de ${card.id}`}
            onClick={() => onReabrir(card.id)}
          >
            ✏️ Alterar decisão
          </Button>
        )}
      </span>
    </div>
  );
}
