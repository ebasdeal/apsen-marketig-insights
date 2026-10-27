'use client';

import type { FonteErrors } from '@domain/fontes/Fonte';
import { FONTE_ICONES } from '@domain/fontes/vocabulario';
import { FormField, FormGrid, FormSelect, TextInput } from '@presentation/components/ui';
import type { FonteFormState } from '../fonteForm';

interface FonteIdentificacaoProps {
  form: FonteFormState;
  errors: FonteErrors;
  onChange: (patch: Partial<FonteFormState>) => void;
}

export function FonteIdentificacao({ form, errors, onChange }: FonteIdentificacaoProps) {
  return (
    <div className="flex flex-col gap-[12px] border-b border-apsen-border pb-[14px]">
      <FormGrid columns={2} className="mb-0! gap-[12px]!">
        <FormField label="Nome da fonte" required error={errors.nome}>
          <TextInput
            value={form.nome}
            placeholder="Ex: Distribuidores / Redes de Farmácia"
            onChange={(nome) => onChange({ nome })}
          />
        </FormField>
        <FormField label="Ícone">
          <FormSelect
            value={form.icon}
            options={FONTE_ICONES}
            onChange={(icon) => {
              if (icon !== '') onChange({ icon });
            }}
          />
        </FormField>
      </FormGrid>
      <FormField label="Descrição">
        <TextInput
          value={form.desc}
          placeholder="Onde esta fonte é usada no sistema"
          onChange={(desc) => onChange({ desc })}
        />
      </FormField>
    </div>
  );
}
