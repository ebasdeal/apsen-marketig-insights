interface BarRowProps {
  label: string;
  value: number;
  max: number;
  valueLabel: string;
  fillClassName?: string;
  valueWidth?: 'wide' | 'compact';
}

function percentOf(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(Math.round((value / max) * 100), 100);
}

export function BarRow({
  label,
  value,
  max,
  valueLabel,
  fillClassName = 'bg-apsen-blue',
  valueWidth = 'wide',
}: BarRowProps) {
  const width = percentOf(value, max);
  return (
    <div className="mb-[9px] flex items-center gap-[10px] text-[12.5px]">
      <span className="w-[110px] shrink-0 truncate font-medium text-apsen-slate">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
        aria-valuetext={valueLabel}
        className="h-[7px] flex-1 overflow-hidden rounded-[4px] bg-apsen-bg"
      >
        <div className={`h-full rounded-[4px] ${fillClassName}`} style={{ width: `${width}%` }} />
      </div>
      <span
        className={`${valueWidth === 'compact' ? 'w-[24px]' : 'min-w-[72px]'} text-right text-[12px] text-apsen-muted`}
      >
        {valueLabel}
      </span>
    </div>
  );
}
