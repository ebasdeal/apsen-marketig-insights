'use client';

import type { CicloErrors } from '@domain/ciclos/Ciclo';
import {
  FormField,
  FormGrid,
  FormSelect,
  StatusField,
  TextInput,
} from '@presentation/components/ui';
import { responsavelOptions, type CicloFormState } from '../cicloForm';

interface CicloFormFieldsProps {
  form: CicloFormState;
  errors: CicloErrors;
  statusDescription: string | null;
  onChange: (patch: Partial<CicloFormState>) => void;
}

export function CicloFormFields({
  form,
  errors,
  statusDescription,
  onChange,
}: CicloFormFieldsProps) {
  return (
    <>
      <FormField label="Código" required hint="Gerado automaticamente.">
        <TextInput value={form.codigo} onChange={() => undefined} readOnly className="font-mono" />
      </FormField>
      <FormField label="Descrição" required error={errors.descricao}>
        <TextInput
          value={form.descricao}
          placeholder="Ex: Planejamento Setembro 2026"
          onChange={(descricao) => onChange({ descricao })}
        />
      </FormField>
      <FormGrid columns={2} className="mb-0! gap-[12px]!">
        <FormField label="Data Início" required error={errors.inicio}>
          <TextInput type="date" value={form.inicio} onChange={(inicio) => onChange({ inicio })} />
        </FormField>
        <FormField label="Data Fim" required error={errors.fim}>
          <TextInput
            type="date"
            value={form.fim}
            {...(form.inicio === '' ? {} : { min: form.inicio })}
            onChange={(fim) => onChange({ fim })}
          />
        </FormField>
      </FormGrid>
      <FormField label="Responsável">
        <FormSelect
          value={form.responsavel}
          options={responsavelOptions(form.responsavel)}
          onChange={(responsavel) => onChange({ responsavel })}
        />
      </FormField>
      {statusDescription === null ? null : (
        <StatusField
          title="Ativar imediatamente"
          description={statusDescription}
          checked={form.ativar}
          onChange={(ativar) => onChange({ ativar })}
          onLabel="Ativo"
          offLabel="Rascunho"
        />
      )}
    </>
  );
}
