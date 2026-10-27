import type { ReactNode } from 'react';

export type FormGridColumns = 1 | 2 | 3;

const COLUMNS: Record<FormGridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2 max-[560px]:grid-cols-1',
  3: 'grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1',
};

interface FormGridProps {
  columns?: FormGridColumns;
  children: ReactNode;
  className?: string;
}

export function FormGrid({ columns = 1, children, className = '' }: FormGridProps) {
  return (
    <div className={`mb-[16px] grid gap-[13px] ${COLUMNS[columns]} ${className}`.trim()}>
      {children}
    </div>
  );
}
