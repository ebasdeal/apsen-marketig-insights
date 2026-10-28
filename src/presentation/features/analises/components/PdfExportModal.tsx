'use client';

import { PDF_SECOES } from '@domain/analises/analiseConstants';
import { Button, Modal } from '@presentation/components/ui';
import { useState } from 'react';
import { useToast } from '../../../providers/ToastProvider';

interface PdfExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PdfExportModal({ open, onClose }: PdfExportModalProps) {
  const toast = useToast();
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
          <Button
            variant="orange"
            size="sm"
            onClick={() => {
              toast.show('📄 Relatório PDF gerado!', { tone: 'success' });
              onClose();
            }}
          >
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
