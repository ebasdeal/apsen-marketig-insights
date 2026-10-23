import type { ReactNode } from 'react';

interface ScreenDescProps {
  icon: string;
  children: ReactNode;
}

export function ScreenDesc({ icon, children }: ScreenDescProps) {
  return (
    <div className="mb-[18px] flex gap-[9px] rounded-apsen border border-apsen-border bg-apsen-bg px-[15px] py-[11px] text-[12.5px] leading-[1.65] text-apsen-slate-3 [&_em]:font-medium [&_em]:not-italic [&_em]:text-apsen-blue [&_strong]:font-semibold [&_strong]:text-apsen-slate">
      <span aria-hidden="true" className="mt-[1px] shrink-0 text-[15px]">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}
