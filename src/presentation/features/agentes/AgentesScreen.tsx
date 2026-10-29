'use client';

import type { AgenteRowDto } from '@application/agentes/dto';
import {
  ApsenLoader,
  BusyRegion,
  ButtonLink,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { AGENTE_NOVO_ROUTE } from '@presentation/navigation/routes';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAgentesPage, useAgentesResumo } from '../../hooks/agentes/useAgentes';
import { useSessao } from '../../hooks/useSessao';
import {
  useTestarAgenteMutation,
  useToggleAgenteMutation,
} from '../../hooks/agentes/useAgenteMutations';
import { useUrlState } from '../../navigation/useUrlState';
import { AgentesAlert } from './components/AgentesAlert';
import { AgentesTable } from './components/AgentesTable';

const AgenteViewModal = dynamic(() =>
  import('./components/AgenteViewModal').then((module) => module.AgenteViewModal),
);

const SPEC = { page: { kind: 'int', default: 1, min: 1 } } as const;

function AgentesResumo() {
  const resumo = useAgentesResumo();
  if (resumo.isError) {
    return null;
  }
  if (resumo.data === undefined) {
    return <ApsenLoader variant="inline" label="Carregando resumo…" />;
  }
  return (
    <>
      <AgentesAlert resumo={resumo.data} />
      <p className="mb-[12px] text-[13px] text-apsen-muted">{resumo.data.resumoTexto}</p>
    </>
  );
}

function AgentesLista({ podeEscrever }: { podeEscrever: boolean }) {
  const [url, setUrl] = useUrlState(SPEC);
  const query = useAgentesPage(url.page);
  const toggle = useToggleAgenteMutation();
  const testar = useTestarAgenteMutation();
  const [vendo, setVendo] = useState<AgenteRowDto | null>(null);
  const testando = testar.isPending ? (testar.variables?.id ?? null) : null;

  if (query.isPending) {
    return <ApsenLoader variant="content" label="Carregando agentes…" />;
  }
  if (query.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os agentes."
        onRetry={() => void query.refetch()}
      />
    );
  }
  return (
    <BusyRegion busy={query.isPlaceholderData}>
      <AgentesTable
        rows={query.data.rows}
        testando={testando}
        podeEscrever={podeEscrever}
        onToggle={(row, ativo) =>
          toggle.mutate({ id: row.id, papel: row.papel, schedule: row.schedule, ativo })
        }
        onTestar={(row) => testar.mutate({ id: row.id, papel: row.papel })}
        onVer={setVendo}
        footer={
          query.data.totalPages > 1 ? (
            <Pagination
              page={url.page}
              totalPages={query.data.totalPages}
              onPageChange={(page) => setUrl({ page })}
            />
          ) : null
        }
      />
      {vendo === null ? null : <AgenteViewModal agente={vendo} onClose={() => setVendo(null)} />}
    </BusyRegion>
  );
}

export function AgentesScreen() {
  const { podeEscrever } = useSessao();
  return (
    <>
      <PageHeader
        title="Agentes de IA"
        description="AI Agent Engine & Crawler · monitoramento e configuração dos agentes de coleta"
        {...(podeEscrever
          ? {
              actions: (
                <ButtonLink href={AGENTE_NOVO_ROUTE} variant="purple" size="sm">
                  + Novo Agente
                </ButtonLink>
              ),
            }
          : {})}
      />
      <ScreenDesc icon="🤖">
        <strong>Gerencia os robôs de coleta automática de drivers externos.</strong> Cada agente
        monitora fontes específicas (DOU, Bulário ANVISA, redes sociais, PubMed) e gera rascunhos de
        drivers que vão para a Fila de Aprovação. Credenciais nunca são armazenadas aqui — apenas a{' '}
        <em>referência ao secret no Azure Key Vault</em>. O BFF busca o token real em runtime via
        Managed Identity.
      </ScreenDesc>
      <AgentesResumo />
      <AgentesLista podeEscrever={podeEscrever} />
    </>
  );
}
