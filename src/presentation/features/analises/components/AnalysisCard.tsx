import type { AnaliseCardOutput } from '@application/analises/dto';
import Link from 'next/link';
import { analiseRoute } from '../../../navigation/routes';
import { AnaliseStatusPill } from './AnaliseStatusPill';

export function metaDoCard(analise: AnaliseCardOutput): string {
  return [
    `🗓️ ${analise.ciclo}`,
    `📦 ${analise.skusCount} SKU(s)`,
    `⚙️ ${analise.modelo}`,
    `📅 ${analise.criada}`,
  ].join('  ·  ');
}

export function AnalysisCard({ analise }: { analise: AnaliseCardOutput }) {
  return (
    <li>
      <Link
        href={analiseRoute(analise.id)}
        aria-label={analise.titulo}
        className="mb-[10px] block rounded-[10px] border border-apsen-border bg-apsen-white px-[18px] py-[14px] transition-[border] duration-[140ms] hover:border-apsen-orange focus-ring"
      >
        <div className="mb-[5px] flex items-center gap-[10px]">
          <span className="flex-1 text-[14px] font-semibold text-apsen-slate">
            {analise.titulo}
          </span>
          <AnaliseStatusPill status={analise.status} />
        </div>
        <p className="text-[12px] text-apsen-muted">{metaDoCard(analise)}</p>
      </Link>
    </li>
  );
}
