import type { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  right?: ReactNode;
}

export function Toolbar({ children, right }: ToolbarProps) {
  return (
    <div className="mb-[13px] flex flex-wrap items-center gap-[8px]">
      {children}
      {right === undefined ? null : <div className="ml-auto flex gap-[6px]">{right}</div>}
    </div>
  );
}
