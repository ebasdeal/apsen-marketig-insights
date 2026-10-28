'use client';

import type { ModeloGuiado, ModoModelo } from '@domain/analises/Analise';
import { Alert, Card, CardTitle, ModeSelector, SelectableCard } from '@presentation/components/ui';
import type { NovaAnaliseAction, NovaAnaliseState } from '../novaAnaliseForm';
import { ParametrosAvancados } from './ParametrosAvancados';

const MODOS = [
  { value: 'auto', label: 'Automático', icon: '🤖', description: 'IA escolhe o modelo' },
  { value: 'guiado', label: 'Guiado', icon: '📋', description: 'Escolha com descrição' },
  { value: 'avancado', label: 'Avançado', icon: '⚙️', description: 'Parâmetros técnicos' },
] as const;

interface ModeloCardProps {
  state: NovaAnaliseState;
  modelosGuiados: readonly ModeloGuiado[];
  erroHorizonte: string | undefined;
  dispatch: (action: NovaAnaliseAction) => void;
}

export function ModeloCard({ state, modelosGuiados, erroHorizonte, dispatch }: ModeloCardProps) {
  return (
    <Card as="section">
      <CardTitle step="04" stepTone="orange">
        Modelo Estatístico
      </CardTitle>
      <div className="mb-[16px]">
        <ModeSelector<ModoModelo>
          aria-label="Modo de escolha do modelo"
          options={MODOS}
          value={state.modo}
          onChange={(valor) => dispatch({ type: 'modo', valor })}
          accent="orange"
          size="md"
        />
      </div>
      {state.modo === 'auto' ? (
        <Alert tone="success">
          A IA selecionará automaticamente o modelo mais adequado e justificará a escolha no
          resultado.
        </Alert>
      ) : null}
      {state.modo === 'guiado' ? (
        <div
          role="radiogroup"
          aria-label="Modelo guiado"
          className="grid grid-cols-3 gap-[10px] max-[1023px]:grid-cols-2 max-[560px]:grid-cols-1"
        >
          {modelosGuiados.map((modelo) => (
            <SelectableCard
              key={modelo.id}
              icon={modelo.icon}
              title={modelo.nome}
              description={modelo.desc}
              tag={modelo.tag}
              selected={state.modeloGuiado === modelo.id}
              onSelect={() => dispatch({ type: 'campo', campo: 'modeloGuiado', valor: modelo.id })}
            />
          ))}
        </div>
      ) : null}
      {state.modo === 'avancado' ? (
        <ParametrosAvancados state={state} erroHorizonte={erroHorizonte} dispatch={dispatch} />
      ) : null}
    </Card>
  );
}
