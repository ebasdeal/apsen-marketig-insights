'use client';

import type { FonteErrors } from '@domain/fontes/Fonte';
import { FonteValidationError } from '@domain/fontes/errors';
import { firstFonteError, validateFonteDraft } from '@domain/fontes/fonteRules';
import { Button, ConfirmDialog, focusFirstInvalid, Modal } from '@presentation/components/ui';
import {
  useCreateFonteMutation,
  useUpdateFonteMutation,
} from '@presentation/hooks/fontes/useFonteMutations';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useRef, useState } from 'react';
import { DESCARTAR } from '../../shared/discardChanges';
import {
  fonteModalTitle,
  initialFonteForm,
  isFonteFormDirty,
  toFonteConfigDraft,
  type FonteFormState,
  type FonteModalMode,
} from '../fonteForm';
import { FonteApiConfig } from './FonteApiConfig';
import { FonteIdentificacao } from './FonteIdentificacao';
import { FonteModoField } from './FonteModoField';

interface FonteModalProps {
  mode: FonteModalMode;
  onClose: () => void;
}

export function FonteModal({ mode, onClose }: FonteModalProps) {
  const [initial] = useState(() => initialFonteForm(mode));
  const [form, setForm] = useState<FonteFormState>(initial);
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<FonteErrors>({});
  const [attempt, setAttempt] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const create = useCreateFonteMutation();
  const update = useUpdateFonteMutation();
  const toast = useToast();
  const pending = create.isPending || update.isPending;
  const change = (patch: Partial<FonteFormState>) =>
    setForm((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (attempt > 0) focusFirstInvalid(bodyRef.current);
  }, [attempt]);

  const showErrors = (next: FonteErrors) => {
    setErrors(next);
    setAttempt((value) => value + 1);
  };

  const onError = (error: Error) => {
    if (error instanceof FonteValidationError) showErrors(error.errors);
  };

  const submit = () => {
    if (pending) return;
    if (mode.modo === 'config') {
      update.mutate(
        { id: mode.fonte.id, config: toFonteConfigDraft(form) },
        { onSuccess: onClose, onError },
      );
      return;
    }
    const found = validateFonteDraft(form, { nova: true, nomesExistentes: [] });
    const message = firstFonteError(found);
    if (message !== undefined) {
      showErrors(found);
      toast.show(message);
      return;
    }
    setErrors({});
    create.mutate({ ...form }, { onSuccess: onClose, onError });
  };

  const requestClose = () => {
    if (pending) return;
    if (isFonteFormDirty(form, initial) || token !== '') setConfirming(true);
    else onClose();
  };

  return (
    <>
      <Modal
        open
        onClose={requestClose}
        title={fonteModalTitle(mode)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={requestClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" loading={pending} onClick={submit}>
              Salvar configuração
            </Button>
          </>
        }
      >
        <div ref={bodyRef} className="flex flex-col gap-[14px]">
          {mode.modo === 'nova' ? (
            <FonteIdentificacao form={form} errors={errors} onChange={change} />
          ) : null}
          <FonteModoField value={form.modo} onChange={(modo) => change({ modo })} />
          {form.modo === 'api' ? (
            <FonteApiConfig
              form={form}
              errors={errors}
              token={token}
              onTokenChange={setToken}
              onChange={change}
            />
          ) : null}
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
