'use client';

import type { Granularidade } from '@domain/drivers/Driver';
import { trocarModo } from '@domain/drivers/draft';
import { dataFimMaxima, mensagemPeriodo, validarPeriodo } from '@domain/drivers/periodo';
import {
  Card,
  CardTitle,
  FormField,
  FormGrid,
  ModeSelector,
  TextInput,
  type ModeOption,
} from '@presentation/components/ui';
import { formatDate } from '@presentation/format/formatters';
import { useId } from 'react';
import { DriverTooltip } from './driverFormTooltips';
import { FamiliaFields } from './FamiliaFields';
import type { CardProps } from './formTypes';
import { FranquiaFields } from './FranquiaFields';
import { SkuFields } from './SkuFields';

const MODOS: readonly ModeOption<Granularidade>[] = [
  { value: 'franquia', icon: '🏢', label: 'Franquia', description: 'Linha terapêutica completa' },
  { value: 'familia', icon: '🔬', label: 'Família', description: 'Molécula / princípio ativo' },
  { value: 'sku', icon: '💊', label: 'SKU', description: 'Produto específico com código' },
];

const FIM_LABEL = (
  <>
    Data Fim
    <span className="ml-[4px] text-[11px] font-normal text-apsen-muted">
      (máx. 1 ano da data início)
    </span>
  </>
);

function dicaFim(inicio: string): string {
  const padrao = dataFimMaxima(inicio);
  return padrao === ''
    ? 'Em branco = 1 ano após a data início.'
    : `Em branco = 1 ano após a data início (${formatDate(padrao)}).`;
}

function DatasFields({ draft, update, errors, disabled }: Omit<CardProps, 'lookups'>) {
  const mensagemId = useId();
  const mensagem = mensagemPeriodo(validarPeriodo(draft.inicio, draft.fim));
  const maxima = dataFimMaxima(draft.inicio);
  const erroFim = mensagem === null ? errors.fim : (errors.fim ?? '');
  return (
    <FormGrid columns={3} className="mb-[14px]">
      <FormField
        label="Data Início"
        required
        tip={<DriverTooltip tip="inicio" rotulo="Data Início" />}
        error={errors.inicio}
      >
        <TextInput
          type="date"
          value={draft.inicio}
          disabled={disabled}
          onChange={(inicio) => update((d) => ({ ...d, inicio }))}
        />
      </FormField>
      <FormField
        label={FIM_LABEL}
        tip={<DriverTooltip tip="fim" rotulo="Data Fim" />}
        hint={dicaFim(draft.inicio)}
        error={erroFim}
      >
        <TextInput
          type="date"
          value={draft.fim}
          disabled={disabled}
          {...(draft.inicio === '' ? {} : { min: draft.inicio, max: maxima })}
          {...(mensagem === null ? {} : { 'aria-describedby': mensagemId })}
          onChange={(fim) => update((d) => ({ ...d, fim }))}
        />
      </FormField>
      {mensagem === null ? null : (
        <div
          id={mensagemId}
          role="alert"
          className="col-span-full -mt-[6px] rounded-[6px] border border-apsen-danger-b-soft bg-apsen-kpi-red px-[10px] py-[7px] text-[12px] leading-[1.5] text-apsen-red"
        >
          {mensagem}
        </div>
      )}
    </FormGrid>
  );
}

export function IdentificacaoCard(props: CardProps) {
  const { draft, update, disabled } = props;
  return (
    <Card>
      <CardTitle step="01" small="Selecione o nível de granularidade do registro">
        Identificação do Evento
      </CardTitle>
      <div className="mb-[14px]">
        <FormField
          label="Título / Nome do Evento"
          tip={<DriverTooltip tip="titulo" rotulo="Título / Nome do Evento" />}
        >
          <TextInput
            value={draft.titulo}
            placeholder="Ex: Campanha Inverno Globo Jan/26"
            disabled={disabled}
            onChange={(titulo) => update((d) => ({ ...d, titulo }))}
          />
        </FormField>
      </div>
      <DatasFields {...props} />
      <div className="mb-[18px]">
        <ModeSelector
          aria-label="Granularidade do registro"
          options={MODOS}
          value={draft.modo}
          disabled={disabled}
          onChange={(modo) => update((d) => trocarModo(d, modo))}
        />
      </div>
      {draft.modo === 'franquia' ? <FranquiaFields {...props} /> : null}
      {draft.modo === 'familia' ? <FamiliaFields {...props} /> : null}
      {draft.modo === 'sku' ? <SkuFields {...props} /> : null}
    </Card>
  );
}
