'use client';

import { useId } from 'react';
import { Toggle } from './Toggle';

interface StatusFieldProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
}

export function StatusField({
  title,
  description,
  checked,
  onChange,
  onLabel = 'Ativo',
  offLabel = 'Inativo',
  disabled = false,
}: StatusFieldProps) {
  const descriptionId = useId();
  return (
    <div className="flex items-center justify-between gap-[14px] rounded-apsen border border-apsen-border bg-apsen-bg px-[14px] py-[11px]">
      <div>
        <strong className="text-[13px] font-medium text-apsen-slate">{title}</strong>
        <span id={descriptionId} className="mt-[2px] block text-[11.5px] text-apsen-muted">
          {description}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-[9px]">
        <span
          className={`text-[12px] font-medium ${checked ? 'text-apsen-green' : 'text-apsen-muted'}`}
        >
          {checked ? onLabel : offLabel}
        </span>
        <Toggle
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={title}
          aria-describedby={descriptionId}
        />
      </div>
    </div>
  );
}
