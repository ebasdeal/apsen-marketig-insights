import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, meta, actions }: PageHeaderProps) {
  const sub = meta ?? description;
  return (
    <header className="mb-[18px] flex flex-wrap items-start justify-between gap-[12px]">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub === undefined ? null : <p className="page-sub">{sub}</p>}
      </div>
      {actions === undefined ? null : (
        <div className="flex flex-wrap items-center gap-[8px]">{actions}</div>
      )}
    </header>
  );
}
