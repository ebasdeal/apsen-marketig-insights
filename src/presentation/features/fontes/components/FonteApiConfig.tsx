'use client';

import type { FonteErrors } from '@domain/fontes/Fonte';
import { FONTE_AUTH } from '@domain/fontes/vocabulario';
import { Button, FormField, FormGrid, FormSelect, TextInput } from '@presentation/components/ui';
import type { FonteFormState } from '../fonteForm';
import { useTesteConexao } from '../useTesteConexao';
import { FonteTestResult } from './FonteTestResult';

interface FonteApiConfigProps {
  form: FonteFormState;
  errors: FonteErrors;
  token: string;
  onTokenChange: (token: string) => void;
  onChange: (patch: Partial<FonteFormState>) => void;
}

const GRID = 'mb-0! gap-[12px]!';

export function FonteApiConfig({
  form,
  errors,
  token,
  onTokenChange,
  onChange,
}: FonteApiConfigProps) {
  const { resultado, testar } = useTesteConexao();
  return (
    <div className="flex flex-col gap-[12px] rounded-apsen border border-apsen-border bg-apsen-bg p-[14px]">
      <FormField label="URL do endpoint" required error={errors.url}>
        <TextInput
          value={form.url}
          placeholder="https://api.apsen.com.br/v1/concorrentes"
          onChange={(url) => onChange({ url })}
        />
        <span className="mt-[2px] text-[11px] text-apsen-muted-2">
          Deve aceitar o parâmetro <code>?busca=</code> para filtro incremental.
        </span>
      </FormField>
      <FormGrid columns={2} className={GRID}>
        <FormField label="Método de autenticação">
          <FormSelect
            value={form.auth}
            options={FONTE_AUTH}
            onChange={(auth) => {
              if (auth !== '') onChange({ auth });
            }}
          />
        </FormField>
        <FormField label="Cache (minutos)">
          <TextInput
            type="number"
            min={0}
            value={form.cache}
            onChange={(cache) => onChange({ cache })}
          />
        </FormField>
      </FormGrid>
      {form.auth === 'none' ? null : (
        <FormField
          label="Token / Chave"
          hint="Armazenado de forma segura no backend — nunca exposto ao frontend."
        >
          <TextInput
            type="password"
            value={token}
            placeholder="••••••••••••••••"
            autoComplete="off"
            onChange={onTokenChange}
          />
        </FormField>
      )}
      <FormGrid columns={2} className={GRID}>
        <FormField label="Campo de valor (JSON path)">
          <TextInput
            value={form.mapValor}
            placeholder="Ex: data[].nome"
            onChange={(mapValor) => onChange({ mapValor })}
          />
        </FormField>
        <FormField label="Campo de rótulo (JSON path)">
          <TextInput
            value={form.mapLabel}
            placeholder="Ex: data[].razao_social"
            onChange={(mapLabel) => onChange({ mapLabel })}
          />
        </FormField>
      </FormGrid>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => testar(form.url)}>
        🔍 Testar conexão
      </Button>
      <FonteTestResult resultado={resultado} />
    </div>
  );
}
