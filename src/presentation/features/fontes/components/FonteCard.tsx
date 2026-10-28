import type { FonteCardDto } from '@application/fontes/dto';
import { Button, Card } from '@presentation/components/ui';

interface FonteCardProps {
  fonte: FonteCardDto;
  onConfigure: (fonte: FonteCardDto) => void;
  onRemove: (fonte: FonteCardDto) => void;
}

const PILL = 'rounded-[20px] px-[9px] py-[2px] text-[11px] font-semibold';

export function FonteCard({ fonte, onConfigure, onRemove }: FonteCardProps) {
  return (
    <Card as="article" className="mb-[12px]! px-[18px]! py-[16px]!">
      <div className="flex items-start gap-[14px] max-[560px]:flex-wrap">
        <div aria-hidden="true" className="shrink-0 text-[26px]">
          {fonte.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[3px] flex flex-wrap items-center gap-[10px]">
            <h2 className="text-[14px] font-semibold text-apsen-slate">{fonte.nome}</h2>
            <span
              className={`${PILL} ${fonte.isApi ? 'bg-apsen-green-bg text-apsen-green-fg' : 'bg-apsen-bg text-apsen-muted'}`}
            >
              {fonte.statusLabel}
            </span>
          </div>
          <p className="mb-[8px] text-[12.5px] leading-[1.5] text-apsen-muted">{fonte.desc}</p>
          {fonte.apiLine === null ? null : (
            <div className="rounded-[6px] bg-apsen-bg px-[10px] py-[6px] font-mono text-[11.5px] break-all text-apsen-muted">
              {fonte.apiLine}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-[6px]">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Configurar ${fonte.nome}`}
            onClick={() => onConfigure(fonte)}
          >
            ⚙️ Configurar
          </Button>
          {fonte.removivel ? (
            <Button
              escrita
              variant="ghost"
              size="sm"
              className="text-apsen-red!"
              aria-label={`Remover a fonte ${fonte.nome}`}
              onClick={() => onRemove(fonte)}
            >
              🗑
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
