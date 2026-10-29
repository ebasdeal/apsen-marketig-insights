'use client';

import type { NovaAnaliseOpcoesOutput } from '@application/analises/dto';
import {
  Breadcrumb,
  Button,
  ErrorState,
  focusFirstInvalid,
  FormActions,
  LoadingState,
  PulseIcon,
  ScreenDesc,
  useUnsavedChangesGuard,
} from '@presentation/components/ui';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useDriversSugeridos, useNovaAnaliseOpcoes } from '../../hooks/analises/useAnalises';
import { ANALISES_ROUTE } from '../../navigation/routes';
import { DriversCard } from './components/DriversCard';
import { IdentificacaoCard } from './components/IdentificacaoCard';
import { ModeloCard } from './components/ModeloCard';
import { SkusCard } from './components/SkusCard';
import {
  ESTADO_INICIAL,
  formDe,
  novaAnaliseReducer,
  type ErrosNovaAnalise,
} from './novaAnaliseForm';
import { useExecutarNovaAnalise } from './useExecutarNovaAnalise';

const TRILHA = [{ label: 'Análises', href: ANALISES_ROUTE }, { label: 'Nova Análise' }];

function NovaAnaliseFormulario({ opcoes }: { opcoes: NovaAnaliseOpcoesOutput }) {
  const [state, dispatch] = useReducer(novaAnaliseReducer, ESTADO_INICIAL);
  const [erros, setErros] = useState<ErrosNovaAnalise>({});
  const [focarErro, setFocarErro] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const skusRef = useRef<HTMLDivElement>(null);
  const drivers = useDriversSugeridos(state.skus.length > 0);
  const { executar, executando, concluida } = useExecutarNovaAnalise((novos) => {
    setErros(novos);
    setFocarErro((atual) => atual + 1);
  });
  const guard = useUnsavedChangesGuard(state.dirty && !concluida);

  useEffect(() => {
    if (focarErro === 0) return;
    if (erros.skus !== undefined) {
      skusRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus();
      return;
    }
    focusFirstInvalid(formRef.current);
  }, [focarErro, erros.skus]);

  const idsDrivers = (drivers.data?.itens ?? []).map((driver) => driver.id);

  return (
    <div ref={formRef}>
      <IdentificacaoCard
        state={state}
        ciclos={opcoes.ciclos}
        erros={erros}
        onCampo={(campo, valor) => dispatch({ type: 'campo', campo, valor })}
        onCiclo={(valor) => dispatch({ type: 'ciclo', valor })}
      />
      <SkusCard
        ciclo={state.ciclo}
        selecionados={state.skus}
        erro={erros.skus}
        listaRef={skusRef}
        onToggle={(codigo, marcado) => dispatch({ type: 'sku', codigo, marcado })}
        onSelecionar={(codigos) => dispatch({ type: 'skus', codigos })}
      />
      {state.skus.length > 0 ? (
        <DriversCard
          dados={drivers.data}
          carregando={drivers.isPending}
          falhou={drivers.isError}
          desmarcados={state.driversDesmarcados}
          onToggle={(id, marcado) => dispatch({ type: 'driver', id, marcado })}
          onRetry={() => void drivers.refetch()}
        />
      ) : null}
      <ModeloCard
        state={state}
        modelosGuiados={opcoes.modelosGuiados}
        erroHorizonte={erros.horizonte}
        dispatch={dispatch}
      />
      <FormActions>
        <Button variant="ghost" onClick={() => guard.confirmLeave(ANALISES_ROUTE)}>
          Cancelar
        </Button>
        <Button
          escrita
          variant="orange"
          size="sm"
          loading={executando}
          loadingLabel="Executando…"
          onClick={() => void executar(formDe(state, idsDrivers))}
        >
          <PulseIcon className="size-[13px]" />
          Executar Análise
        </Button>
      </FormActions>
      {guard.dialog}
    </div>
  );
}

export function NovaAnaliseScreen() {
  const opcoes = useNovaAnaliseOpcoes();
  return (
    <>
      <Breadcrumb items={TRILHA} backHref={ANALISES_ROUTE} />
      <ScreenDesc icon="⚙️">
        <strong>Configure o escopo: ciclo, SKUs e drivers.</strong> A IA pré-seleciona os drivers
        relevantes. Escolha o modelo estatístico — use <em>Automático</em> se não tiver certeza.
      </ScreenDesc>
      {opcoes.isPending ? <LoadingState label="Carregando ciclos…" /> : null}
      {opcoes.isError ? (
        <ErrorState
          message="Não foi possível carregar os ciclos e modelos."
          onRetry={() => void opcoes.refetch()}
        />
      ) : null}
      {opcoes.data === undefined ? null : <NovaAnaliseFormulario opcoes={opcoes.data} />}
    </>
  );
}
