import type { NavBadgeTone } from './navItems';

const TONE_CLASS: Record<NavBadgeTone, string> = {
  blue: 'bg-apsen-blue text-[10px]',
  teal: 'bg-apsen-teal text-[10px]',
  red: 'bg-apsen-red text-[10px]',
  purple: 'bg-apsen-purple text-[10px]',
  orange: 'bg-apsen-orange text-[10px]',
  gray: 'bg-apsen-muted text-[10px]',
  soon: 'bg-apsen-cyan text-[9px]',
};

interface NavBadgeProps {
  value: number | string;
  tone?: NavBadgeTone;
}

export function NavBadge({ value, tone = 'blue' }: NavBadgeProps) {
  return (
    <span
      className={`ml-auto whitespace-nowrap rounded-[20px] px-[7px] py-[1px] font-bold text-white ${TONE_CLASS[tone]}`}
    >
      {value}
    </span>
  );
}
