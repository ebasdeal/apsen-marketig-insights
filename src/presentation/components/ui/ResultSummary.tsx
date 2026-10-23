import type { ReactNode } from 'react';

interface ResultSummaryProps {
  children: ReactNode;
  action?: ReactNode;
}

export function ResultSummary({ children, action }: ResultSummaryProps) {
  return (
    <div className="mb-[12px] flex items-center justify-between">
      <p aria-live="polite" className="text-[13px] text-apsen-muted">
        {children}
      </p>
      {action}
    </div>
  );
}
