'use client';

import type { DriverFormLookupsDto } from '@application/drivers/dto';
import type { Driver } from '@domain/drivers/Driver';
import { isDraftSujo, limpar, type DriverDraft } from '@domain/drivers/draft';
import type { DraftErro } from '@domain/drivers/validarDraft';
import {
  Button,
  FormActions,
  focusFirstInvalid,
  useUnsavedChangesGuard,
} from '@presentation/components/ui';
import type { Route } from 'next';
import { useRef, useState } from 'react';
import { CheckIcon } from '../components/driverIcons';
import { CoberturaCard } from './CoberturaCard';
import { DynamicFieldsCard } from './DynamicFieldsCard';
import type { DraftUpdater, FieldErrors, FormMode } from './formTypes';
import { IdentificacaoCard } from './IdentificacaoCard';
import { TipoDriverCard } from './TipoDriverCard';
import { useDriverSubmit } from './useDriverSubmit';

interface DriverFormProps {
  mode: FormMode;
  lookups: DriverFormLookupsDto;
  inicial: DriverDraft;
  original: Driver | undefined;
  destino: Route;
}

const GUARD = {
  title: 'Sair sem salvar?',
  message: 'As alterações deste driver serão perdidas.',
  confirmLabel: 'Sair sem salvar',
  cancelLabel: 'Continuar editando',
};

function errosDe(erro: DraftErro): FieldErrors {
  const periodo = erro.campo === 'fim' && erro.mensagem !== 'Informe a data fim.';
  return { [erro.campo]: periodo ? '' : erro.mensagem };
}

export function DriverForm({ mode, lookups, inicial, original, destino }: DriverFormProps) {
  const [draft, setDraft] = useState(inicial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [versao, setVersao] = useState(0);
  const [salvo, setSalvo] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const disabled = mode === 'view';
  const campos = lookups.camposPorTipo[draft.tipo];
  const guard = useUnsavedChangesGuard(!disabled && !salvo && isDraftSujo(draft, inicial), GUARD);
  const { submit, pending } = useDriverSubmit({
    mode,
    original,
    destino,
    onSaved: () => setSalvo(true),
    onInvalid: (erro) => {
      setErrors(errosDe(erro));
      requestAnimationFrame(() => focusFirstInvalid(formRef.current));
    },
  });

  const update: DraftUpdater = (fn) => setDraft((atual) => fn(atual));
  const props = { draft, update, errors, disabled, lookups };

  function limparTudo() {
    setDraft((atual) =>
      limpar(atual, {
        intensidades: lookups.intensidades,
        canaisDefault: lookups.config.canaisDefault,
      }),
    );
    setErrors({});
    setVersao((v) => v + 1);
  }

  const acoes = disabled ? null : (
    <FormActions>
      <Button variant="ghost" onClick={limparTudo} disabled={pending}>
        Limpar
      </Button>
      <Button type="submit" loading={pending}>
        <CheckIcon />
        {mode === 'edit' ? 'Salvar alterações' : 'Adicionar Registro'}
      </Button>
    </FormActions>
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending) void submit(draft, campos?.campos ?? []);
      }}
    >
      <IdentificacaoCard key={`id-${versao}-${draft.modo}`} {...props} />
      <TipoDriverCard {...props} tipoOriginal={original?.tipo ?? ''} />
      {draft.tipo !== '' && campos !== undefined ? (
        <DynamicFieldsCard key={`dyn-${draft.tipo}`} {...props} config={campos} />
      ) : null}
      {draft.tipo === '' ? null : <CoberturaCard {...props} actions={acoes} />}
      {guard.dialog}
    </form>
  );
}
