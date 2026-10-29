import type { ReactNode } from 'react';
import { AlertCircleIcon } from './icons';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const BASE =
  'mb-[14px] flex items-start gap-[9px] rounded-apsen border px-[14px] py-[10px] text-[12.5px] leading-[1.6]';
const TONES: Record<AlertTone, string> = {
  info: 'border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue',
  success: 'border-apsen-green-b bg-apsen-green-bg text-apsen-success-fg',
  warning: 'border-apsen-yellow-b bg-apsen-yellow-bg text-apsen-warning-fg',
  error: 'border-apsen-red-b bg-apsen-red-bg text-apsen-danger-fg',
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Alert({ tone = 'info', title, children, className = '', icon }: AlertProps) {
  const role = tone === 'warning' || tone === 'error' ? 'alert' : 'status';
  return (
    <div role={role} data-tone={tone} className={`${BASE} ${TONES[tone]} ${className}`.trim()}>
      {icon ?? <AlertCircleIcon className="mt-[3px] size-[14px] shrink-0" />}
      <span>
        {title === undefined ? null : <strong>{title} </strong>}
        {children}
      </span>
    </div>
  );
}
