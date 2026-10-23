'use client';

import type { ReactNode } from 'react';
import { Button } from './Button';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Carregando…' }: LoadingStateProps) {
  return (
    <div role="status" className="state-block">
      <div aria-hidden="true" className="mb-[10px] text-[36px]">
        ⟳
      </div>
      <p className="text-[12.5px]">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  title?: string;
  icon?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  message,
  title = 'Não foi possível carregar os dados',
  icon = '⚠️',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex h-[60vh] flex-col items-center justify-center gap-[10px] text-center text-apsen-muted"
    >
      <div aria-hidden="true" className="mb-[8px] text-[44px]">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-apsen-slate">{title}</h3>
      {message === undefined ? null : <p className="text-[13px]">{message}</p>}
      {onRetry === undefined ? null : (
        <Button variant="outline" className="mt-[16px]" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
      {action === undefined ? null : <div className="mt-[16px]">{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = '📣',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="state-block">
      <div aria-hidden="true" className="mb-[10px] text-[36px]">
        {icon}
      </div>
      <p className="mb-[4px] text-[13.5px] font-medium text-apsen-slate">{title}</p>
      {description === undefined ? null : <small className="text-[12px]">{description}</small>}
      {actionLabel === undefined || onAction === undefined ? null : (
        <div>
          <Button variant="outline" size="sm" className="mt-[16px]" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

interface InlineEmptyProps {
  children: ReactNode;
}

export function InlineEmpty({ children }: InlineEmptyProps) {
  return <p className="p-[20px] text-center text-[13px] text-apsen-muted">{children}</p>;
}
