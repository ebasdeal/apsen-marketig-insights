'use client';

import { useId, useRef, type ReactNode } from 'react';
import { useFocusTrap } from './useFocusTrap';

export type ModalSize = 'md' | 'lg';

const WIDTH: Record<ModalSize, string> = { md: 'w-[500px]', lg: 'w-[680px]' };
const CLOSE =
  'cursor-pointer rounded-[4px] border-0 bg-transparent px-[6px] py-[2px] text-[17px] leading-none text-apsen-muted hover:bg-apsen-bg hover:text-apsen-slate focus-ring';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

function ModalDialog({ onClose, title, children, footer, size = 'md' }: Omit<ModalProps, 'open'>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onKeyDown = useFocusTrap(dialogRef, onClose);
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-apsen-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className={`flex max-h-[90vh] max-w-[95vw] flex-col rounded-apsen-lg bg-apsen-white shadow-apsen-modal ${WIDTH[size]}`}
      >
        <div className="flex items-center justify-between border-b border-apsen-border px-[20px] pt-[16px] pb-[13px]">
          <h3 id={titleId} className="text-[14.5px] font-semibold text-apsen-slate">
            {title}
          </h3>
          <button type="button" aria-label="Fechar" onClick={onClose} className={CLOSE}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="flex flex-col gap-[13px] overflow-y-auto px-[20px] py-[18px]">
          {children}
        </div>
        {footer === undefined ? null : (
          <div className="flex justify-end gap-[8px] border-t border-apsen-border px-[20px] py-[12px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Modal({ open, ...rest }: ModalProps) {
  return open ? <ModalDialog {...rest} /> : null;
}
