import type { ImpactoOutput } from '@application/analises/dto';

export function ImpactRow({ impacto }: { impacto: ImpactoOutput }) {
  const subiu = impacto.dir === 'up';
  return (
    <li className="flex items-center gap-[10px] border-b border-apsen-bg py-[6px] text-[13px] last:border-b-0">
      <span className="flex-1 text-[12.5px]">
        {impacto.tipo} <span className="text-[11.5px] text-apsen-muted">{impacto.id}</span>
      </span>
      <span
        aria-hidden="true"
        className={`h-[6px] shrink-0 rounded-[3px] ${subiu ? 'bg-apsen-green' : 'bg-apsen-red'}`}
        style={{ width: `${impacto.largura}px` }}
      />
      <span
        className={`min-w-[44px] text-right text-[13px] font-bold ${subiu ? 'text-apsen-green' : 'text-apsen-red'}`}
      >
        {`${impacto.sinal}${impacto.impacto}%`}
      </span>
      <span className="min-w-[52px] text-right text-[11.5px] text-apsen-muted">
        {`${impacto.conf}% conf.`}
      </span>
    </li>
  );
}
