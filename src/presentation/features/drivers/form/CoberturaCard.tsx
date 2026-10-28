'use client';

import { isIntensidade } from '@domain/drivers/Driver';
import { definirIntensidade, definirRegioes, editarUplift } from '@domain/drivers/draft';
import { dicaUplift, infoIntensidade, legendaIntensidade } from '@domain/drivers/intensidade';
import {
  Card,
  CardTitle,
  ChipMultiSelect,
  FormField,
  FormGrid,
  RangeSlider,
  TextArea,
  TextInput,
} from '@presentation/components/ui';
import type { ReactNode } from 'react';
import { DriverTooltip } from './driverFormTooltips';
import type { CardProps } from './formTypes';

function IntensidadeBloco({ draft, update, disabled, lookups }: CardProps) {
  const legenda = legendaIntensidade(draft.intensidade, lookups.intensidades);
  const info = infoIntensidade(draft.intensidade, lookups.intensidades);
  return (
    <div className="flex flex-col gap-[5px]">
      <FormField
        label="Intensidade esperada"
        tip={<DriverTooltip tip="intensidade" rotulo="Intensidade esperada" />}
      >
        <RangeSlider
          aria-label="Intensidade esperada"
          min={1}
          max={5}
          value={draft.intensidade}
          disabled={disabled}
          onChange={(n) => {
            if (isIntensidade(n)) update((d) => definirIntensidade(d, n, lookups.intensidades));
          }}
        />
      </FormField>
      <div
        aria-live="polite"
        className="mt-[6px] rounded-[6px] border-l-[3px] border-apsen-blue bg-apsen-bg px-[10px] py-[7px] text-[11.5px] leading-[1.5] text-apsen-muted"
      >
        {legenda === null ? null : (
          <>
            <strong>{legenda.titulo}</strong> · uplift típico <strong>{legenda.faixa}</strong>
            <br />
            {legenda.descricao}
          </>
        )}
      </div>
      <div className="mt-[12px]">
        <FormField
          label={
            <>
              Uplift esperado (%) <small className="font-normal text-apsen-muted">(opcional)</small>
            </>
          }
          tip={<DriverTooltip tip="uplift" rotulo="Uplift esperado (%)" />}
        >
          <div className="flex max-w-[220px] items-center gap-[8px]">
            <TextInput
              type="number"
              step="0.5"
              placeholder="15"
              className="text-right"
              value={draft.uplift}
              disabled={disabled}
              onChange={(valor) => update((d) => editarUplift(d, valor))}
            />
            <span className="text-[14px] font-semibold text-apsen-muted">%</span>
          </div>
        </FormField>
        <p aria-live="polite" className="mt-[2px] text-[11px] text-apsen-muted-2">
          {dicaUplift(draft.upliftManual, info)}
        </p>
      </div>
    </div>
  );
}

export function CoberturaCard({ actions, ...props }: CardProps & { actions?: ReactNode }) {
  const { draft, update, disabled, lookups } = props;
  const { regioes, canais } = lookups.config;
  return (
    <Card>
      <CardTitle step="04">Cobertura, Canal &amp; Impacto</CardTitle>
      <FormGrid columns={2}>
        <ChipMultiSelect
          label="Regiões cobertas"
          tip={<DriverTooltip tip="regioes" rotulo="Regiões cobertas" />}
          options={regioes}
          selected={draft.regioes}
          disabled={disabled}
          onChange={(next) => update((d) => definirRegioes(d, next))}
        />
        <ChipMultiSelect
          label="Canal impactado"
          tip={<DriverTooltip tip="canal" rotulo="Canal impactado" />}
          options={canais}
          selected={draft.canais}
          disabled={disabled}
          onChange={(next) => update((d) => ({ ...d, canais: next }))}
        />
      </FormGrid>
      <FormGrid columns={2} className="mt-[6px]">
        <IntensidadeBloco {...props} />
        <FormField
          label="Verba / Investimento R$"
          error={props.errors.verba}
          tip={<DriverTooltip tip="verba" rotulo="Verba / Investimento R$" />}
        >
          <TextInput
            type="number"
            min={0}
            placeholder="Ex: 250000"
            value={draft.verba}
            disabled={disabled}
            onChange={(verba) => update((d) => ({ ...d, verba }))}
          />
        </FormField>
        <FormField
          full
          label="Observações / contexto"
          tip={<DriverTooltip tip="observacoes" rotulo="Observações / contexto" />}
        >
          <TextArea
            placeholder="Contexto relevante: antecipação de compra, lag de efeito estimado, ressalvas para o analista..."
            value={draft.observacoes}
            disabled={disabled}
            onChange={(observacoes) => update((d) => ({ ...d, observacoes }))}
          />
        </FormField>
      </FormGrid>
      {actions}
    </Card>
  );
}
