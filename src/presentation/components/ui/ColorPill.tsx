import type { ReactNode } from 'react';
import { PILL_OUTLINED, PILL_SOFT, type PillColor } from './pillColors';

interface ColorPillProps {
  color: PillColor;
  variant?: 'outlined' | 'soft';
  children: ReactNode;
}

const BASE = 'inline-flex w-fit items-center whitespace-nowrap px-[9px] py-[2px]';

export function ColorPill({ color, variant = 'outlined', children }: ColorPillProps) {
  const classes =
    variant === 'outlined'
      ? `rounded-[10px] border text-[11.5px] font-semibold ${PILL_OUTLINED[color]}`
      : `rounded-[6px] text-[11px] font-bold ${PILL_SOFT[color]}`;
  return <span className={`${BASE} ${classes}`}>{children}</span>;
}
