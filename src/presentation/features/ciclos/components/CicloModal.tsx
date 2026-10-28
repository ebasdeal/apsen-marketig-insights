'use client';

import type { CiclosResumoDto } from '@application/ciclos/dto';
import type { CicloErrors } from '@domain/ciclos/Ciclo';
import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import { firstError, validateCicloDraft } from '@domain/ciclos/cicloRules';
import { Button, ConfirmDialog, focusFirstInvalid, Modal } from '@presentation/components/ui';
import { useSaveCicloMutation } from '@presentation/hooks/ciclos/useCicloMutations';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useRef, useState } from 'react';
import { DESCARTAR } from '../../shared/discardChanges';
import {
  ativarDescription,
  initialCicloForm,
  isCicloFormDirty,
  showsStatusField,
  toCicloDraft,
  type CicloFormState,
  type CicloModalMode,
} from '../cicloForm';
import { CicloFormFields } from './CicloFormFields';

interface CicloModalProps {
  mode: CicloModalMode;
  resumo: CiclosResumoDto;
  onClose: () => void;
}

export function CicloModal({ mode, resumo, onClose }: CicloModalProps) {
  const [initial] = useState(() => initialCicloForm(mode, resumo));
  const [form, setForm] = useState<CicloFormState>(initial);
  const [errors, setErrors] = useState<CicloErrors>({});
  const [attempt, setAttempt] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const save = useSaveCicloMutation();
  const toast = useToast();
  const novo = mode.modo === 'novo';

  useEffect(() => {
    if (attempt > 0) focusFirstInvalid(fieldsRef.current);
  }, [attempt]);

  const showErrors = (next: CicloErrors) => {
    setErrors(next);
    setAttempt((value) => value + 1);
  };

  const submit = () => {
    if (save.isPending) return;
    const draft = toCicloDraft(form);
    const found = validateCicloDraft(draft);
    const message = firstError(found);
    if (message !== undefined) {
      showErrors(found);
      toast.show(message);
      return;
    }
    setErrors({});
    save.mutate(novo ? { modo: 'novo', draft } : { modo: 'editar', id: mode.ciclo.id, draft }, {
      onSuccess: onClose,
      onError: (error) => {
        if (error instanceof CicloValidationError) showErrors(error.errors);
      },
    });
  };

  const requestClose = () => {
    if (save.isPending) return;
    if (isCicloFormDirty(form, initial)) setConfirming(true);
    else onClose();
  };

  return (
    <>
      <Modal
        open
        onClose={requestClose}
        title={novo ? 'Novo Ciclo de Planejamento' : 'Editar Ciclo de Planejamento'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={requestClose}>
              Cancelar
            </Button>
            <Button escrita variant="orange" size="sm" loading={save.isPending} onClick={submit}>
              {novo ? 'Criar Ciclo' : 'Salvar alterações'}
            </Button>
          </>
        }
      >
        <div ref={fieldsRef} className="flex flex-col gap-[13px]">
          <CicloFormFields
            form={form}
            errors={errors}
            statusDescription={showsStatusField(mode) ? ativarDescription(resumo.ativo) : null}
            onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          />
        </div>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title={DESCARTAR.title}
        message={DESCARTAR.message}
        cancelLabel={DESCARTAR.cancelLabel}
        confirmLabel={DESCARTAR.confirmLabel}
        onCancel={() => setConfirming(false)}
        onConfirm={onClose}
      />
    </>
  );
}
