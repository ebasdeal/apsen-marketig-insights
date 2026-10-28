'use client';

import { PDF_SECOES } from '@domain/analises/analiseConstants';
import { Button, Modal } from '@presentation/components/ui';
import { useState } from 'react';

interface PdfExportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export default function PdfExportModal({
  open,
  onClose,
  onConfirm,
  pending = false,
}: PdfExportModalProps) {
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PDF_SECOES.map((secao) => [secao.id, secao.marcada])),
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Exportar Relatório PDF"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="orange" size="sm" loading={pending} onClick={onConfirm}>
            Baixar PDF
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-[1.55] text-apsen-muted">
        Selecione as seções a incluir no relatório.
      </p>
      <div className="flex flex-col gap-[8px]">
        {PDF_SECOES.map((secao) => (
          <label key={secao.id} className="flex cursor-pointer items-center gap-[8px] text-[13px]">
            <input
              type="checkbox"
              checked={marcadas[secao.id] ?? false}
              onChange={(event) =>
                setMarcadas((atuais) => ({ ...atuais, [secao.id]: event.target.checked }))
              }
              className="accent-apsen-orange"
            />
            {secao.label}
          </label>
        ))}
      </div>
    </Modal>
  );
}
