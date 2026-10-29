import type { ReactNode } from 'react';

interface BusyRegionProps {
  busy: boolean;
  children: ReactNode;
  className?: string;
}

export function BusyRegion({ busy, children, className = '' }: BusyRegionProps) {
  return (
    <div
      aria-busy={busy}
      className={`transition-opacity duration-200 motion-reduce:transition-none ${busy ? 'opacity-60' : 'opacity-100'} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
