'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { InfoIcon } from './icons';
import { placeTooltip } from './tooltipPlacement';

const TRIGGER =
  'inline-flex cursor-help items-center border-0 bg-transparent p-0 text-apsen-muted-2 transition-colors hover:text-apsen-blue focus-visible:text-apsen-blue focus-ring';
const BOX =
  'pointer-events-none fixed top-0 left-0 z-[9000] w-max max-w-[320px] rounded-apsen bg-apsen-tip-bg px-[14px] py-[11px] text-left text-[12px] leading-[1.65] font-normal whitespace-normal normal-case not-italic tracking-normal text-apsen-tip-fg shadow-apsen-tip [&_em]:not-italic [&_em]:text-apsen-tip-em [&_strong]:font-semibold [&_strong]:text-apsen-tip-strong';
const ARROW =
  "absolute size-0 border-[5px] border-transparent data-[placement=above]:top-full data-[placement=above]:border-t-apsen-tip-bg data-[placement=below]:bottom-full data-[placement=below]:border-b-apsen-tip-bg content-['']";

function noopSubscribe(): () => void {
  return () => undefined;
}

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);
  const canPortal = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    const reposition = () => {
      if (trigger.current && box.current && content.current && arrow.current) {
        placeTooltip(trigger.current, box.current, content.current, arrow.current);
      }
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  const bubble = (
    <span id={id} ref={box} role="tooltip" hidden={!open} className={BOX}>
      <span ref={content} className="block overflow-hidden">
        {children}
      </span>
      <span ref={arrow} aria-hidden="true" className={ARROW} />
    </span>
  );

  return (
    <span
      className="relative ml-[4px] inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={trigger}
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
      {canPortal ? createPortal(bubble, document.body) : null}
    </span>
  );
}
