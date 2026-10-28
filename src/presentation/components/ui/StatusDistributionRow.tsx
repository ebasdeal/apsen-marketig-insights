type DistributionTone = 'green' | 'orange' | 'red' | 'muted';

interface StatusDistributionRowProps {
  label: string;
  count: number;
  pct: number;
  tone: DistributionTone;
  pctLabel?: string;
}

const TONES: Record<DistributionTone, { bg: string; text: string }> = {
  green: { bg: 'bg-apsen-green', text: 'text-apsen-green' },
  orange: { bg: 'bg-apsen-orange', text: 'text-apsen-orange' },
  red: { bg: 'bg-apsen-red', text: 'text-apsen-red' },
  muted: { bg: 'bg-apsen-muted', text: 'text-apsen-muted' },
};

export function StatusDistributionRow({
  label,
  count,
  pct,
  tone,
  pctLabel,
}: StatusDistributionRowProps) {
  const color = TONES[tone];
  const width = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="mb-[10px] flex items-center gap-[10px]">
      <span aria-hidden="true" className={`size-[9px] shrink-0 rounded-full ${color.bg}`} />
      <span className="min-w-0 flex-1 text-[13px]">{label}</span>
      <span className={`text-[13px] font-semibold ${color.text}`}>{count}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
        aria-valuetext={`${width}%`}
        className="h-[5px] w-[70px] shrink-0 overflow-hidden rounded-[3px] bg-apsen-bg"
      >
        <div className={`h-full ${color.bg}`} style={{ width: `${width}%` }} />
      </div>
      <span className="min-w-[28px] text-right text-[11px] text-apsen-muted">
        {pctLabel ?? `${width}%`}
      </span>
    </div>
  );
}
