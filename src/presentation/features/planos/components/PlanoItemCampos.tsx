'use client';

import type { PlanoItemDetailOutput } from '@application/planos/dto';
import type { PlanoItemForm, PlanoStatus } from '@domain/planos/PlanoItem';
import {
  LINHAS,
  PLANO_STATUS_LABEL,
  RESPONSAVEIS_PLANO,
  SEMANAS,
} from '@domain/planos/planoConstants';
import {
  Card,
  CardTitle,
  FormField,
  FormSelect,
  TextArea,
  TextInput,
} from '@presentation/components/ui';
import type { ReactNode } from 'react';
import { mensagemDoCampo, type PlanoCampoErro } from '../planoErro';

interface PlanoItemCamposProps {
  item: PlanoItemDetailOutput;
  form: PlanoItemForm;
  erro: PlanoCampoErro | null;
  somenteLeitura: boolean;
  onChange: (patch: Partial<PlanoItemForm>) => void;
  acoes: ReactNode;
}

const opcoes = (valores: readonly string[]) => valores.map((value) => ({ value, label: value }));
const STATUS_ORDEM: readonly PlanoStatus[] = ['pendente', 'revisao', 'aprovado', 'bloqueado'];
const STATUS_OPCOES = STATUS_ORDEM.map((value) => ({ value, label: PLANO_STATUS_LABEL[value] }));
const CAMPOS = 'flex flex-col';

export function PlanoItemCampos({
  item,
  form,
  erro,
  somenteLeitura,
  onChange,
  acoes,
}: PlanoItemCamposProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1">
        <Card>
          <CardTitle>Identificação do Item</CardTitle>
          <div className={CAMPOS}>
            <FormField label="Código do plano">
              <TextInput
                readOnly
                className="font-mono"
                value={item.codigo}
                onChange={() => undefined}
              />
            </FormField>
            <FormField label="Produto / SKU">
              <TextInput readOnly value={item.produtoLabel} onChange={() => undefined} />
            </FormField>
            <FormField label="Família">
              <TextInput readOnly value={item.familia} onChange={() => undefined} />
            </FormField>
          </div>
        </Card>
        <Card>
          <CardTitle>Programação</CardTitle>
          <div className={CAMPOS}>
            <FormField label="Qtd. Planejada" required error={mensagemDoCampo(erro, 'qtd')}>
              <TextInput
                type="number"
                min={1}
                step={1}
                placeholder="Ex: 50000"
                disabled={somenteLeitura}
                value={form.qtd}
                onChange={(qtd) => onChange({ qtd })}
              />
            </FormField>
            <FormField label="Linha de Produção" required>
              <FormSelect
                disabled={somenteLeitura}
                value={form.linha}
                options={opcoes(LINHAS)}
                onChange={(linha) => onChange({ linha })}
              />
            </FormField>
            <FormField label="Semana de Produção" required>
              <FormSelect
                disabled={somenteLeitura}
                value={form.semana}
                options={opcoes(SEMANAS)}
                onChange={(semana) => onChange({ semana })}
              />
            </FormField>
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Status &amp; Justificativa</CardTitle>
        <div className="grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
          <FormField label="Status">
            <FormSelect
              disabled={somenteLeitura}
              value={form.status}
              options={STATUS_OPCOES}
              onChange={(status) => {
                if (status !== '') onChange({ status });
              }}
            />
          </FormField>
          <FormField label="Responsável">
            <FormSelect
              disabled={somenteLeitura}
              value={form.resp}
              options={opcoes(RESPONSAVEIS_PLANO)}
              onChange={(resp) => onChange({ resp })}
            />
          </FormField>
          <FormField label="Justificativa / Observação" full>
            <TextArea
              rows={2}
              disabled={somenteLeitura}
              placeholder="Motivo de revisão, bloqueio ou ajuste de quantidade..."
              value={form.obs}
              onChange={(obs) => onChange({ obs })}
            />
          </FormField>
        </div>
        {acoes}
      </Card>
    </>
  );
}
