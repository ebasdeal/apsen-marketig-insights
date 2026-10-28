'use client';

import type { RestricaoForm } from '@domain/restricoes/Restricao';
import type { RestricaoCampo } from '@domain/restricoes/RestricaoInvalidaError';
import {
  RESPONSAVEIS,
  RESTRICAO_TIPO_OPCOES,
  SEVERIDADE_OPCOES,
} from '@domain/restricoes/restricaoConstants';
import { FormField, FormSelect, TextArea, TextInput } from '@presentation/components/ui';

export interface CampoErro {
  campo: RestricaoCampo;
  mensagem: string;
}

interface RestricaoFormFieldsProps {
  form: RestricaoForm;
  erro: CampoErro | null;
  onChange: (patch: Partial<RestricaoForm>) => void;
}

const RESPONSAVEL_OPCOES = RESPONSAVEIS.map((nome) => ({ value: nome, label: nome }));

function erroDe(erro: CampoErro | null, campo: RestricaoCampo): string | undefined {
  return erro?.campo === campo ? erro.mensagem : undefined;
}

export function RestricaoFormFields({ form, erro, onChange }: RestricaoFormFieldsProps) {
  return (
    <>
      <FormField label="Tipo" required error={erroDe(erro, 'tipo')}>
        <FormSelect
          value={form.tipo}
          placeholder="Selecione..."
          options={RESTRICAO_TIPO_OPCOES}
          onChange={(tipo) => onChange({ tipo })}
        />
      </FormField>
      <FormField label="Severidade" required>
        <FormSelect
          value={form.sev}
          options={SEVERIDADE_OPCOES}
          onChange={(sev) => {
            if (sev !== '') onChange({ sev });
          }}
        />
      </FormField>
      <FormField label="Descrição" required error={erroDe(erro, 'desc')}>
        <TextInput
          value={form.desc}
          maxLength={200}
          placeholder="Ex: Falta de IFA — Baricitinibe · Fornecedor com atraso"
          onChange={(desc) => onChange({ desc })}
        />
      </FormField>
      <FormField label="Produto / Linha Afetada">
        <TextInput
          value={form.produto}
          placeholder="Ex: Baricitinibe 2mg e 4mg · Linha 2"
          onChange={(produto) => onChange({ produto })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
        <FormField label="Impacto">
          <TextInput
            value={form.impacto}
            placeholder="Ex: Bloqueio total"
            onChange={(impacto) => onChange({ impacto })}
          />
        </FormField>
        <FormField label="Prazo">
          <TextInput
            type="date"
            value={form.prazoIso}
            onChange={(prazoIso) => onChange({ prazoIso })}
          />
        </FormField>
      </div>
      <FormField label="Responsável">
        <FormSelect
          value={form.resp}
          options={RESPONSAVEL_OPCOES}
          onChange={(resp) => onChange({ resp })}
        />
      </FormField>
      <FormField label="Observações">
        <TextArea
          rows={2}
          value={form.obs}
          placeholder="Contexto adicional, ações em andamento..."
          onChange={(obs) => onChange({ obs })}
        />
      </FormField>
      <div className="rounded-apsen border border-apsen-danger-b-soft bg-apsen-kpi-red px-[13px] py-[10px] text-[12.5px] leading-[1.6] text-apsen-danger-ink">
        <strong>Lembre:</strong> se envolve falta de MP ou ruptura, registre também um{' '}
        <strong>Driver de Demanda</strong> correspondente para tratar a demanda censurada.
      </div>
    </>
  );
}
