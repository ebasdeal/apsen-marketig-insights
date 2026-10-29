'use client';

import type { OpcaoSelect } from '@application/analises/dto';
import { ANALISE_TIPOS } from '@domain/analises/analiseConstants';
import {
  Card,
  CardTitle,
  FormField,
  FormGrid,
  FormSelect,
  TextArea,
  TextInput,
} from '@presentation/components/ui';
import type { ErrosNovaAnalise, NovaAnaliseCampo, NovaAnaliseState } from '../novaAnaliseForm';

const TIPOS = ANALISE_TIPOS.map((tipo) => ({ value: tipo, label: tipo }));

interface IdentificacaoCardProps {
  state: NovaAnaliseState;
  ciclos: readonly OpcaoSelect[];
  erros: ErrosNovaAnalise;
  onCampo: (campo: NovaAnaliseCampo, valor: string) => void;
  onCiclo: (valor: string) => void;
}

export function IdentificacaoCard({
  state,
  ciclos,
  erros,
  onCampo,
  onCiclo,
}: IdentificacaoCardProps) {
  return (
    <Card as="section">
      <CardTitle step="01" stepTone="orange">
        Identificação
      </CardTitle>
      <FormGrid columns={2}>
        <FormField label="Título da análise" required full error={erros.titulo}>
          <TextInput
            value={state.titulo}
            onChange={(valor) => onCampo('titulo', valor)}
            placeholder="Ex: Impacto campanha TV Inverno — Baricitinibe"
            maxLength={160}
          />
        </FormField>
        <FormField label="Ciclo" required error={erros.ciclo}>
          <FormSelect
            value={state.ciclo}
            onChange={onCiclo}
            options={ciclos}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Tipo de análise">
          <FormSelect
            value={state.tipo}
            onChange={(valor) => onCampo('tipo', valor === '' ? ANALISE_TIPOS[0] : valor)}
            options={TIPOS}
          />
        </FormField>
        <FormField label="Comentários / contexto" full>
          <TextArea
            rows={2}
            value={state.comentarios}
            onChange={(valor) => onCampo('comentarios', valor)}
            placeholder="Hipóteses, perguntas-chave, restrições..."
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}
