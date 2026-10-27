'use client';

import {
  opcoesDoSelect,
  PARAM_LABORATORIO,
  PARAM_MOLECULA_HERDADA,
} from '@domain/drivers/camposDinamicos';
import { definirParametro, escolherSugestao, type DriverDraft } from '@domain/drivers/draft';
import type { CampoTipo } from '@domain/drivers/lookups';
import { FormField, FormSelect, TextInput } from '@presentation/components/ui';
import { ConcorrenteAutocomplete } from './ConcorrenteAutocomplete';
import type { DraftUpdater } from './formTypes';

interface DynamicFieldProps {
  campo: CampoTipo;
  draft: DriverDraft;
  update: DraftUpdater;
  error: string | undefined;
  disabled: boolean;
}

function Label({ campo }: { campo: CampoTipo }) {
  if (campo.labelHint === undefined) {
    return <>{campo.label}</>;
  }
  return (
    <>
      {campo.label} <small className="font-normal text-apsen-muted">{campo.labelHint}</small>
    </>
  );
}

function Control({ campo, draft, update, disabled }: Omit<DynamicFieldProps, 'error'>) {
  const value = draft.parametros[campo.param] ?? '';
  const set = (next: string) => update((d) => definirParametro(d, campo.param, next));
  if (campo.type === 'select') {
    const { soltas, grupos } = opcoesDoSelect(campo, value);
    return (
      <FormSelect
        value={value}
        disabled={disabled}
        options={soltas.map((opcao) => ({ value: opcao, label: opcao }))}
        groups={grupos.map((grupo) => ({
          label: grupo.grupo,
          options: grupo.opcoes.map((opcao) => ({ value: opcao, label: opcao })),
        }))}
        onChange={set}
      />
    );
  }
  if (campo.type === 'autocomplete' && !disabled) {
    return (
      <ConcorrenteAutocomplete
        campo={campo}
        value={value}
        laboratorio={draft.parametros[PARAM_LABORATORIO] ?? ''}
        onType={set}
        onPick={(next) => update((d) => escolherSugestao(d, campo.param, next))}
      />
    );
  }
  const herdado = draft.herdado !== null && PARAM_MOLECULA_HERDADA[draft.tipo] === campo.param;
  const placeholder = herdado
    ? `${draft.herdado} (herdado — edite se o concorrente for diferente)`
    : campo.placeholder;
  return (
    <TextInput
      type={campo.type === 'autocomplete' ? 'text' : campo.type}
      value={value}
      disabled={disabled}
      readOnly={campo.readonly === true}
      placeholder={placeholder}
      className={herdado ? 'bg-apsen-teal-soft!' : ''}
      {...(campo.step === undefined ? {} : { step: campo.step })}
      onChange={set}
    />
  );
}

export function DynamicField({ campo, error, ...rest }: DynamicFieldProps) {
  return (
    <FormField label={<Label campo={campo} />} required={campo.required} error={error}>
      <Control campo={campo} {...rest} />
    </FormField>
  );
}
