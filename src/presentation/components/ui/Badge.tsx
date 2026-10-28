import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'teal' | 'purple' | 'orange';
export type BadgeSize = 'md' | 'lg' | 'xl';

const BASE = 'inline-flex w-fit items-center whitespace-nowrap rounded-[20px]';

const DOT = "before:size-[5px] before:shrink-0 before:rounded-full before:content-['']";

const SIZES: Record<BadgeSize, string> = {
  md: `gap-[5px] px-[9px] py-[3px] text-[11.5px] font-medium ${DOT}`,
  lg: 'border px-[12px] py-[4px] text-[12px] font-semibold',
  xl: `gap-[5px] px-[13px] py-[5px] text-[12.5px] font-medium ${DOT}`,
};

const TONES: Record<BadgeTone, string> = {
  blue: 'bg-apsen-blue-bg text-apsen-blue before:bg-apsen-blue',
  green: 'bg-apsen-green-bg text-apsen-green-fg before:bg-apsen-green',
  yellow: 'bg-apsen-yellow-bg text-apsen-yellow-fg before:bg-apsen-yellow',
  red: 'bg-apsen-red-bg text-apsen-red before:bg-apsen-red',
  gray: 'bg-apsen-bg text-apsen-muted before:bg-apsen-muted-2',
  teal: 'bg-apsen-teal-bg text-apsen-teal before:bg-apsen-teal',
  purple: 'bg-apsen-purple-bg text-apsen-purple before:bg-apsen-purple',
  orange: 'bg-apsen-orange-bg text-apsen-orange before:bg-apsen-orange',
};

const BORDERS: Record<BadgeTone, string> = {
  blue: 'border-apsen-blue-light',
  green: 'border-apsen-green-b',
  yellow: 'border-apsen-yellow-b',
  red: 'border-apsen-red-b',
  gray: 'border-apsen-border',
  teal: 'border-apsen-teal-light',
  purple: 'border-apsen-purple-b',
  orange: 'border-apsen-orange-b',
};

interface BadgeProps {
  tone: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
  'data-status'?: string;
}

function badgeClasses(tone: BadgeTone, size: BadgeSize): string {
  const border = size === 'lg' ? ` ${BORDERS[tone]}` : '';
  return `${BASE} ${SIZES[size]} ${TONES[tone]}${border}`;
}

export function Badge({ tone, size = 'md', children, 'data-status': status }: BadgeProps) {
  return (
    <span data-status={status} className={badgeClasses(tone, size)}>
      {children}
    </span>
  );
}
