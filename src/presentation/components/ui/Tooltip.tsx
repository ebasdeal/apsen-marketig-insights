'use client';

import { useId, useState, type ReactNode } from 'react';
import { InfoIcon } from './icons';

const TRIGGER =
  'inline-flex cursor-help items-center border-0 bg-transparent p-0 text-apsen-muted-2 transition-colors hover:text-apsen-blue focus-visible:text-apsen-blue focus-ring';
const BOX =
  "pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-[9000] w-[290px] -translate-x-1/2 rounded-apsen bg-apsen-tip-bg px-[14px] py-[11px] text-left text-[12px] leading-[1.65] font-normal whitespace-normal normal-case not-italic tracking-normal text-apsen-tip-fg shadow-apsen-tip before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-apsen-tip-bg before:content-[''] [&_em]:not-italic [&_em]:text-apsen-tip-em [&_strong]:font-semibold [&_strong]:text-apsen-tip-strong";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative ml-[4px] inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={TRIGGER}
      >
        <InfoIcon className="size-[14px] shrink-0" />
      </button>
      <span id={id} role="tooltip" hidden={!open} className={BOX}>
        {children}
      </span>
    </span>
  );
}
