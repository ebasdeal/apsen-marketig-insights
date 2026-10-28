import type { Route } from 'next';
import Link from 'next/link';

export type KpiTone = 'blue' | 'green' | 'orange' | 'red';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  tone?: KpiTone;
  hintTone?: KpiTone | 'yellow';
  href?: Route;
  className?: string;
}

const CARD =
  'flex flex-col gap-[5px] rounded-[10px] border border-apsen-border bg-apsen-white px-[20px] py-[18px] transition-shadow';
const NAVIGABLE = 'cursor-pointer hover:shadow-apsen-hover';

const ICON_BG: Record<KpiTone, string> = {
  blue: 'bg-apsen-kpi-blue',
  green: 'bg-apsen-kpi-green',
  orange: 'bg-apsen-kpi-orange',
  red: 'bg-apsen-kpi-red',
};

const TONE_TEXT: Record<KpiTone | 'yellow', string> = {
  yellow: 'text-apsen-yellow',
  blue: 'text-apsen-blue',
  green: 'text-apsen-green',
  orange: 'text-apsen-orange',
  red: 'text-apsen-red',
};

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'blue',
  hintTone,
  href,
  className = '',
}: KpiCardProps) {
  const card = (
    <article
      aria-label={`${label}: ${value}`}
      className={`${CARD} ${href === undefined ? className : `h-full ${NAVIGABLE}`}`.trim()}
    >
      {icon === undefined ? null : (
        <div
          aria-hidden="true"
          className={`mb-[4px] flex size-[36px] items-center justify-center rounded-[9px] text-[18px] ${ICON_BG[tone]}`}
        >
          {icon}
        </div>
      )}
      <p className={`text-[26px] font-extrabold leading-[1.1] ${TONE_TEXT[tone]}`}>{value}</p>
      <h3 className="text-[12.5px] font-medium text-apsen-muted">{label}</h3>
      {hint === undefined ? null : (
        <p className="mt-[2px] text-[11.5px]">
          <span className={`font-semibold ${TONE_TEXT[hintTone ?? tone]}`}>{hint}</span>
        </p>
      )}
    </article>
  );
  if (href === undefined) return card;
  return (
    <Link href={href} className={`block rounded-[10px] focus-ring ${className}`.trim()}>
      {card}
    </Link>
  );
}
