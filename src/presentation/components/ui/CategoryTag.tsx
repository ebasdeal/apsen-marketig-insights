import type { ReactNode } from 'react';
import { CATEGORY_TONES, type CategoryTone } from './categoryTones';

interface CategoryTagProps {
  tone: CategoryTone;
  children: ReactNode;
  className?: string;
}

export function CategoryTag({ tone, children, className = '' }: CategoryTagProps) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[4px] border px-[8px] py-[2px] text-[10.5px] font-bold ${CATEGORY_TONES[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
