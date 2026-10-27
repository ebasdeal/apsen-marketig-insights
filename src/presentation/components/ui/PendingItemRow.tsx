import type { Route } from 'next';
import { ButtonLink } from './Button';

interface PendingItemRowProps<T extends string> {
  code: string;
  title: string;
  subtitle?: string;
  actionLabel: string;
  actionHref: Route<T>;
}

export function PendingItemRow<T extends string>({
  code,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: PendingItemRowProps<T>) {
  return (
    <div className="flex items-center gap-[10px] border-b border-apsen-bg py-[8px] text-[13px] last:border-b-0">
      <span className="min-w-[95px] font-mono text-[11px] font-semibold text-apsen-blue">
        {code}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium">{title}</div>
        {subtitle === undefined ? null : (
          <div className="text-[11.5px] text-apsen-muted">{subtitle}</div>
        )}
      </div>
      <ButtonLink href={actionHref} variant="ghost" size="xs">
        {actionLabel}
      </ButtonLink>
    </div>
  );
}
