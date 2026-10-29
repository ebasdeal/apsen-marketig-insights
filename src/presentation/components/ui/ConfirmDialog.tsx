'use client';

import { useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'danger' | 'primary';
  pending?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  tone = 'danger',
  pending = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    if (!pending) onCancel();
  };
  const body = message ?? description;
  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      size="md"
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="ghost" size="sm" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'red' : 'primary'}
            size="sm"
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {body === undefined ? null : <p className="text-[13px] text-apsen-slate-3">{body}</p>}
    </Modal>
  );
}
