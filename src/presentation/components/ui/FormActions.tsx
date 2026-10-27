import type { ReactNode } from 'react';

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div
      className={`flex flex-wrap justify-end gap-[8px] border-t border-apsen-border pt-[14px] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
