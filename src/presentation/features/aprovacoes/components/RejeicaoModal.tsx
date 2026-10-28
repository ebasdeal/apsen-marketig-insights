'use client';

import { validateRejeicao } from '@domain/aprovacoes/aprovacaoRules';
import type { RejeicaoErrors } from '@domain/aprovacoes/errors';
import { MOTIVOS_REJEICAO } from '@domain/aprovacoes/vocabulario';
import {
  Button,
  focusFirstInvalid,
  FormField,
  FormSelect,
  Modal,
  TextArea,
} from '@presentation/components/ui';
import { useRejeitarMutation } from '@presentation/hooks/aprovacoes/useAprovacaoMutations';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useRef, useState } from 'react';

interface RejeicaoModalProps {
  id: string;
  onClose: () => void;
}

const MOTIVOS = MOTIVOS_REJEICAO.map((motivo) => ({ value: motivo, label: motivo }));

export function RejeicaoModal({ id, onClose }: RejeicaoModalProps) {
  const [motivo, setMotivo] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [errors, setErrors] = useState<RejeicaoErrors | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const rejeitar = useRejeitarMutation();
  const toast = useToast();

  useEffect(() => {
    if (errors !== null) focusFirstInvalid(body.current?.closest('[role="dialog"]') ?? null);
  }, [errors]);

  const confirmar = () => {
    const encontrados = validateRejeicao({ motivo, justificativa });
    const mensagem = encontrados.motivo ?? encontrados.justificativa;
    if (mensagem !== undefined) {
      setErrors(encontrados);
      toast.show(mensagem);
      return;
    }
    rejeitar.mutate({ id, motivo, justificativa });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Rejeitar Item"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            escrita
            variant="danger"
            size="sm"
            loading={rejeitar.isPending}
            onClick={confirmar}
          >
            Confirmar Rejeição
          </Button>
        </>
      }
    >
      <div ref={body} className="flex flex-col gap-[13px]">
        <p className="text-[13px] leading-[1.55] text-apsen-muted">
          Informe o motivo da rejeição. O planejador responsável será notificado e o item retornará
          para revisão.
        </p>
        <FormField label="Motivo" required error={errors?.motivo}>
          <FormSelect
            value={motivo}
            onChange={setMotivo}
            placeholder="Selecione..."
            options={MOTIVOS}
          />
        </FormField>
        <FormField label="Justificativa detalhada" required error={errors?.justificativa}>
          <TextArea
            rows={3}
            value={justificativa}
            onChange={setJustificativa}
            placeholder="Descreva o motivo da rejeição..."
          />
        </FormField>
      </div>
    </Modal>
  );
}
