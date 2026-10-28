'use client';

import type { AgenteDraft, Provedor } from '@domain/agentes/Agente';
import type { AgenteErros } from '@domain/agentes/agenteRules';
import {
  AGENTE_AMBIENTES,
  AGENTE_MODELOS,
  AGENTE_PAPEIS,
  AGENTE_PROVEDORES,
  LIMIAR_MAX,
  LIMIAR_MIN,
} from '@domain/agentes/vocabulario';
import {
  Alert,
  Card,
  CardTitle,
  FormField,
  FormGrid,
  FormSelect,
  RangeSlider,
  TextArea,
  TextInput,
  Tooltip,
} from '@presentation/components/ui';
import { LockIcon } from '../../usuarios/components/actionIcons';

export interface AgenteCardProps {
  draft: AgenteDraft;
  erros: AgenteErros;
  onChange: (patch: Partial<AgenteDraft>) => void;
}

const MONO = 'font-mono';

function opcoes(lista: readonly string[]) {
  return lista.map((value) => ({ value, label: value }));
}

export function AgenteIdentificacaoCard({ draft, erros, onChange }: AgenteCardProps) {
  return (
    <Card>
      <CardTitle>Identificação</CardTitle>
      <FormGrid columns={2}>
        <FormField label="Papel do Agente" required error={erros.papelOpcao}>
          <FormSelect
            value={draft.papelOpcao}
            onChange={(papelOpcao) => onChange({ papelOpcao })}
            options={opcoes(AGENTE_PAPEIS)}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Nome de exibição" required error={erros.nome}>
          <TextInput
            value={draft.nome}
            onChange={(nome) => onChange({ nome })}
            placeholder="Ex: Agente Regulatório — Produção"
          />
        </FormField>
        <FormField label="Provedor" required error={erros.provedor}>
          <FormSelect<Provedor>
            value={draft.provedor}
            onChange={(provedor) => onChange({ provedor })}
            options={AGENTE_PROVEDORES}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Ambiente" required error={erros.ambiente}>
          <FormSelect
            value={draft.ambiente}
            onChange={(ambiente) => onChange({ ambiente })}
            options={opcoes(AGENTE_AMBIENTES)}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Endpoint" required full error={erros.endpoint}>
          <TextInput
            className={MONO}
            value={draft.endpoint}
            onChange={(endpoint) => onChange({ endpoint })}
            placeholder="Ex: https://apsen-di.services.ai.azure.com"
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}

export function AgenteKeyVaultCard({ draft, erros, onChange }: AgenteCardProps) {
  return (
    <Card>
      <CardTitle>Azure Key Vault — Credencial</CardTitle>
      <Alert tone="warning" icon={<LockIcon className="mt-[3px] shrink-0" />}>
        Armazene apenas a <strong>referência</strong> ao secret — nunca o token real. O BFF busca em
        runtime via Managed Identity.
      </Alert>
      <FormGrid columns={2}>
        <FormField label="Key Vault URI" required error={erros.vault}>
          <TextInput
            className={MONO}
            value={draft.vault}
            onChange={(vault) => onChange({ vault })}
            placeholder="https://apsen-keyvault.vault.azure.net"
          />
        </FormField>
        <FormField
          label="Secret Name"
          required
          error={erros.secret}
          hint="Nome do secret — não o valor."
        >
          <TextInput
            className={MONO}
            value={draft.secret}
            onChange={(secret) => onChange({ secret })}
            placeholder="Ex: apsen-di-reg-agent-key"
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}

function LimiarTip() {
  return (
    <Tooltip label="Sobre o limiar de confiança">
      <strong>Confiança mínima</strong> para o rascunho ir para a Fila de Aprovação.
      <br />
      <br />
      Abaixo deste limiar, o rascunho é descartado automaticamente.
      <br />
      <br />
      <em>Ex:</em> 75% → apenas rascunhos com confiança ≥ 75% chegam à fila para curadoria humana.
      Limiares baixos geram mais ruído; altos podem perder eventos relevantes.
    </Tooltip>
  );
}

interface ModeloCardProps extends AgenteCardProps {
  schedules: readonly string[];
  modeloExtra: string | undefined;
}

export function AgenteModeloCard({
  draft,
  erros,
  onChange,
  schedules,
  modeloExtra,
}: ModeloCardProps) {
  return (
    <Card>
      <CardTitle>Modelo &amp; Execução</CardTitle>
      <FormGrid columns={2}>
        <FormField label="Modelo padrão" required error={erros.modelo}>
          <FormSelect
            value={draft.modelo}
            onChange={(modelo) => onChange({ modelo })}
            options={modeloExtra === undefined ? [] : opcoes([modeloExtra])}
            groups={AGENTE_MODELOS.map((grupo) => ({
              label: grupo.group,
              options: opcoes(grupo.options),
            }))}
            placeholder="Selecione..."
          />
        </FormField>
        <FormField label="Schedule" required>
          <FormSelect
            value={draft.schedule}
            onChange={(schedule) => onChange({ schedule })}
            options={opcoes(schedules)}
          />
        </FormField>
        <FormField
          label="Fontes monitoradas"
          full
          hint="URLs separadas por vírgula. O agente fará scraping nestas fontes."
        >
          <TextArea
            rows={2}
            value={draft.fontes}
            onChange={(fontes) => onChange({ fontes })}
            placeholder="Ex: https://www.in.gov.br, https://consultas.anvisa.gov.br"
          />
        </FormField>
        <FormField label="Limiar de confiança para enfileirar (%)" full tip={<LimiarTip />}>
          <RangeSlider
            aria-label="Limiar de confiança para enfileirar (%)"
            min={LIMIAR_MIN}
            max={LIMIAR_MAX}
            accent="purple"
            value={draft.limiar}
            onChange={(limiar) => onChange({ limiar })}
            format={(value) => `${value}%`}
          />
        </FormField>
      </FormGrid>
    </Card>
  );
}
