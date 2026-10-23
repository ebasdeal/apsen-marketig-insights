import { formatPercent } from '@presentation/format/formatters';

interface ProgressBarProps {
  value: number | null;
  label: string;
}

const MIN = 0;
const MAX = 100;

function clamp(value: number): number {
  return Math.min(Math.max(value, MIN), MAX);
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const exceeded = value !== null && value > MAX;
  const width = value === null ? MIN : clamp(value);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuetext={formatPercent(value)}
      {...(value === null ? {} : { 'aria-valuenow': width })}
      data-exceeded={exceeded}
      className="h-[7px] w-full overflow-hidden rounded-[4px] bg-apsen-border"
    >
      <div
        className={`h-full rounded-[4px] transition-[width] duration-[400ms] ${exceeded ? 'bg-apsen-red' : 'bg-apsen-blue'}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
