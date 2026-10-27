import type { ReactNode } from 'react';

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  full?: boolean;
}

export function DetailField({ label, children, full = false }: DetailFieldProps) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <div className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.05em] text-apsen-muted">
        {label}
      </div>
      <div className="text-[13px]">{children}</div>
    </div>
  );
}
