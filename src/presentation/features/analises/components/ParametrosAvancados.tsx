'use client';

import {
  MODELOS_AVANCADOS,
  MODELOS_ENSEMBLE,
  PARAMS_SARIMAX,
  SAZONALIDADES_PROPHET,
} from '@domain/analises/analiseConstants';
import { FormField, FormGrid, FormSelect, TextInput } from '@presentation/components/ui';
import type { NovaAnaliseAction, NovaAnaliseState } from '../novaAnaliseForm';

const ROTULO = 'text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted';

interface Props {
  state: NovaAnaliseState;
  erroHorizonte: string | undefined;
  dispatch: (action: NovaAnaliseAction) => void;
}

function Checks({
  titulo,
  nomes,
  marcados,
  onChange,
}: {
  titulo: string;
  nomes: readonly string[];
  marcados: Record<string, boolean>;
  onChange: (nome: string, marcado: boolean) => void;
}) {
  return (
    <fieldset className="col-span-full">
      <legend className={ROTULO}>{titulo}</legend>
      <div className="mt-[6px] flex flex-wrap gap-[10px]">
        {nomes.map((nome) => (
          <label key={nome} className="flex cursor-pointer items-center gap-[5px] text-[12.5px]">
            <input
              type="checkbox"
              checked={marcados[nome] ?? false}
              onChange={(event) => onChange(nome, event.target.checked)}
              className="accent-apsen-orange"
            />
            {nome}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Sarimax({ state, dispatch }: Omit<Props, 'erroHorizonte'>) {
  return (
    <fieldset className="col-span-full">
      <legend className={ROTULO}>Ordem ARIMA (p,d,q) e Sazonal (P,D,Q,s)</legend>
      <div className="mt-[6px] grid grid-cols-7 gap-[6px]">
        {PARAMS_SARIMAX.map((param) => (
          <label key={param} className="block">
            <span className="mb-[2px] block text-center text-[10px] text-apsen-muted">{param}</span>
            <TextInput
              type="number"
              min={0}
              max={12}
              step={1}
              aria-label={`Parâmetro ${param}`}
              value={state.sarimax[param] ?? ''}
              onChange={(valor) => dispatch({ type: 'sarimax', param, valor })}
              className="px-[2px] py-[6px] text-center"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ParametrosAvancados({ state, erroHorizonte, dispatch }: Props) {
  const modelo = state.modeloAvancado;
  return (
    <FormGrid columns={2}>
      <FormField label="Modelo" required>
        <FormSelect
          value={modelo}
          options={MODELOS_AVANCADOS}
          onChange={(valor) =>
            dispatch({ type: 'campo', campo: 'modeloAvancado', valor: valor || 'sarimax' })
          }
        />
      </FormField>
      <FormField label="Horizonte (meses)" error={erroHorizonte}>
        <TextInput
          type="number"
          min={1}
          max={24}
          step={1}
          value={state.horizonte}
          onChange={(valor) => dispatch({ type: 'campo', campo: 'horizonte', valor })}
        />
      </FormField>
      {modelo === 'sarimax' ? <Sarimax state={state} dispatch={dispatch} /> : null}
      {modelo === 'prophet' ? (
        <Checks
          titulo="Sazonalidades"
          nomes={SAZONALIDADES_PROPHET}
          marcados={state.sazonalidades}
          onChange={(nome, marcado) => dispatch({ type: 'sazonalidade', nome, marcado })}
        />
      ) : null}
      {modelo === 'ensemble' ? (
        <Checks
          titulo="Modelos a combinar"
          nomes={MODELOS_ENSEMBLE}
          marcados={state.ensemble}
          onChange={(nome, marcado) => dispatch({ type: 'ensemble', nome, marcado })}
        />
      ) : null}
    </FormGrid>
  );
}
