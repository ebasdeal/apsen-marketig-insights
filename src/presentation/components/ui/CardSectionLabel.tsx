import type { ReactNode } from 'react';

export function CardSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-[13px] flex items-center gap-[6px] border-b-2 border-apsen-blue-bg pt-[12px] pb-[8px] text-[10.5px] font-bold uppercase tracking-[.08em] text-apsen-blue">
      {children}
    </h3>
  );
}
