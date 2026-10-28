import type { ReactNode } from 'react';

interface FilterBarProps {
  'aria-label': string;
  children: ReactNode;
  columnsClassName?: string;
}

export function FilterBar({
  'aria-label': label,
  children,
  columnsClassName = 'grid-cols-[1fr_auto_auto_auto_auto]',
}: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label={label}
      className={`mb-[16px] grid items-end gap-[10px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[16px] py-[14px] ${columnsClassName} max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`}
    >
      {children}
    </div>
  );
}
