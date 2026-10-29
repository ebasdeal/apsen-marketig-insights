'use client';

import type { SkuOpcaoOutput } from '@application/planos/dto';
import type { InclusaoForm } from '@domain/planos/PlanoItem';
import { LINHAS, RESPONSAVEIS_PLANO, SEMANAS } from '@domain/planos/planoConstants';
import {
  Alert,
  ApsenLoader,
  Button,
  FormField,
  FormSelect,
  TextInput,
} from '@presentation/components/ui';
import { mensagemDoCampo, type PlanoCampoErro } from '../planoErro';

interface SkusEstado {
  opcoes: readonly SkuOpcaoOutput[] | undefined;
  erro: boolean;
  onRetry: () => void;
}

interface IncluirItemFieldsProps {
  form: InclusaoForm;
  erro: PlanoCampoErro | null;
  skus: SkusEstado;
  onChange: (patch: Partial<InclusaoForm>) => void;
}

const opcoes = (valores: readonly string[]) => valores.map((value) => ({ value, label: value }));
const LINHA_OPCOES = opcoes(LINHAS);
const SEMANA_OPCOES = opcoes(SEMANAS);
const RESP_OPCOES = opcoes(RESPONSAVEIS_PLANO);

function SkuSelect({ form, skus, onChange }: Omit<IncluirItemFieldsProps, 'erro'>) {
  if (skus.erro) {
    return (
      <Alert tone="error">
        Não foi possível carregar os SKUs.{' '}
        <Button variant="outline" size="sm" onClick={skus.onRetry}>
          Tentar novamente
        </Button>
      </Alert>
    );
  }
  if (skus.opcoes === undefined) {
    return <ApsenLoader variant="inline" label="Carregando SKUs…" />;
  }
  return (
    <FormSelect
      value={form.sku}
      placeholder="Selecione o SKU..."
      options={skus.opcoes}
      onChange={(sku) => onChange({ sku })}
    />
  );
}

export function IncluirItemFields({ form, erro, skus, onChange }: IncluirItemFieldsProps) {
  return (
    <>
      <FormField label="Produto / SKU" required error={mensagemDoCampo(erro, 'sku')}>
        <SkuSelect form={form} skus={skus} onChange={onChange} />
      </FormField>
      <div className="grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
        <FormField label="Qtd. Planejada (cp)" required error={mensagemDoCampo(erro, 'qtd')}>
          <TextInput
            type="number"
            min={1}
            step={1}
            placeholder="Ex: 50000"
            value={form.qtd}
            onChange={(qtd) => onChange({ qtd })}
          />
        </FormField>
        <FormField label="Linha" required>
          <FormSelect
            value={form.linha}
            options={LINHA_OPCOES}
            onChange={(linha) => onChange({ linha })}
          />
        </FormField>
        <FormField label="Semana de Produção" required>
          <FormSelect
            value={form.semana}
            options={SEMANA_OPCOES}
            onChange={(semana) => onChange({ semana })}
          />
        </FormField>
        <FormField label="Responsável">
          <FormSelect
            value={form.resp}
            options={RESP_OPCOES}
            onChange={(resp) => onChange({ resp })}
          />
        </FormField>
      </div>
      <FormField label="Justificativa">
        <TextInput
          placeholder="Motivo da inclusão, fonte da previsão..."
          value={form.obs}
          onChange={(obs) => onChange({ obs })}
        />
      </FormField>
    </>
  );
}
