'use client';

import type { AgenteFormDto } from '@application/agentes/dto';
import type { AgenteDraft } from '@domain/agentes/Agente';
import {
  optionsComExtra,
  validateAgenteDraft,
  type AgenteErros,
} from '@domain/agentes/agenteRules';
import { AgenteValidationError } from '@domain/agentes/errors';
import { AGENTE_SCHEDULES } from '@domain/agentes/vocabulario';
import {
  Breadcrumb,
  Button,
  Card,
  CardTitle,
  FormActions,
  PulseIcon,
  ScreenDesc,
  StatusField,
  useUnsavedChangesGuard,
} from '@presentation/components/ui';
import { AGENTES_ROUTE } from '@presentation/navigation/routes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSaveAgenteMutation } from '../../hooks/agentes/useAgenteMutations';
import { FALHA_SALVAR } from '../../hooks/mutationFeedback';
import { useToast } from '../../providers/ToastProvider';
import { sameDraft, useFocusOnErrors } from '../usuarios/useFocusOnErrors';
import {
  AgenteIdentificacaoCard,
  AgenteKeyVaultCard,
  AgenteModeloCard,
} from './components/AgenteCards';
import { useTesteConexaoForm } from './useTesteConexaoForm';

interface AgenteFormProps extends AgenteFormDto {
  id?: string;
}

export function AgenteForm({ id, draft: initial, extras }: AgenteFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const save = useSaveAgenteMutation();
  const testar = useTesteConexaoForm();
  const [draft, setDraft] = useState(initial);
  const [erros, setErros] = useState<AgenteErros>({});
  const { ref, focusErrors } = useFocusOnErrors<HTMLFormElement>();
  const guard = useUnsavedChangesGuard(!save.isSuccess && !sameDraft(draft, initial), {
    title: 'Descartar alterações?',
    message: 'As alterações feitas neste formulário serão perdidas.',
    confirmLabel: 'Descartar',
  });

  const change = (patch: Partial<AgenteDraft>) => setDraft((atual) => ({ ...atual, ...patch }));
  const falhar = (novos: AgenteErros) => {
    setErros(novos);
    show(Object.values(novos)[0] ?? FALHA_SALVAR);
    focusErrors();
  };

  const submit = async () => {
    const locais = validateAgenteDraft(draft);
    if (Object.keys(locais).length > 0) {
      falhar(locais);
      return;
    }
    try {
      const result = await save.mutateAsync({ ...(id === undefined ? {} : { id }), draft });
      show(result.toast);
      router.push(AGENTES_ROUTE);
    } catch (error) {
      if (error instanceof AgenteValidationError) {
        falhar(error.erros);
      } else {
        show(FALHA_SALVAR);
      }
    }
  };

  const props = { draft, erros, onChange: change };
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Agentes', href: AGENTES_ROUTE },
          { label: id === undefined ? 'Novo Agente' : 'Editar Agente' },
        ]}
        backHref={AGENTES_ROUTE}
      />
      <ScreenDesc icon="🛠️">
        <strong>Configura um agente de coleta automática de drivers.</strong> O campo{' '}
        <em>Secret Name</em> armazena apenas a referência ao secret no Azure Key Vault — nunca o
        valor real. O <em>limiar de confiança</em> define o que vai para a Fila de Aprovação e o que
        é descartado automaticamente.
      </ScreenDesc>
      <form
        ref={ref}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <AgenteIdentificacaoCard {...props} />
        <AgenteKeyVaultCard {...props} />
        <AgenteModeloCard
          {...props}
          schedules={optionsComExtra(AGENTE_SCHEDULES, extras.schedule ?? '')}
          modeloExtra={extras.modelo}
        />
        <Card>
          <CardTitle>Status</CardTitle>
          <StatusField
            title="Ativo / Inativo"
            description="Agentes inativos não executam o schedule. Rascunhos existentes na fila são preservados."
            checked={draft.ativo}
            onChange={(ativo) => change({ ativo })}
          />
          <FormActions className="mt-[14px]">
            <Button variant="ghost" onClick={() => guard.confirmLeave(AGENTES_ROUTE)}>
              Cancelar
            </Button>
            <Button variant="outline" size="sm" onClick={testar}>
              <PulseIcon className="size-[13px]" />
              Testar Conexão
            </Button>
            <Button
              type="submit"
              variant="purple"
              size="sm"
              loading={save.isPending}
              loadingLabel="Salvando…"
            >
              Salvar Agente
            </Button>
          </FormActions>
        </Card>
      </form>
      {guard.dialog}
    </>
  );
}
