'use client';

import type { ListAprovacoesResult } from '@application/aprovacoes/dto';
import type { AprovFiltro, AprovStatus } from '@domain/aprovacoes/Aprovacao';
import { pluralPendentes, resumoTexto } from '@domain/aprovacoes/aprovacaoRules';
import {
  ApsenLoader,
  Badge,
  BusyRegion,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  ResultSummary,
  ScreenDesc,
} from '@presentation/components/ui';
import {
  useAprovarMutation,
  useReabrirMutation,
} from '@presentation/hooks/aprovacoes/useAprovacaoMutations';
import { useAprovacoesPage, usePendentesCount } from '@presentation/hooks/aprovacoes/useAprovacoes';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useDebouncedSearch } from '../adminDi/useDebouncedSearch';
import { ApprovalCard } from './components/ApprovalCard';
import { AprovacoesFilters } from './components/AprovacoesFilters';

const RejeicaoModal = dynamic(() =>
  import('./components/RejeicaoModal').then((module) => module.RejeicaoModal),
);

const URL_SPEC = {
  q: { kind: 'string', default: '' },
  ini: { kind: 'string', default: '' },
  fim: { kind: 'string', default: '' },
  tipo: { kind: 'string', default: '' },
  status: { kind: 'enum', default: '', values: ['', 'pendente', 'aprovado', 'rejeitado'] },
  page: { kind: 'int', default: 1, min: 1 },
} as const;

function Resumo({ data }: { data: ListAprovacoesResult }) {
  const { registros, pendentes } = resumoTexto(data.total, data.pendentesNoResultado);
  const numero = String(data.total);
  return (
    <>
      <strong>{numero}</strong>
      {registros.slice(numero.length)}
      {pendentes === null ? null : (
        <>
          {' · '}
          <span className="font-medium text-apsen-yellow-fg">{pendentes}</span>
        </>
      )}
    </>
  );
}

function rolarParaOTopo() {
  document.querySelector('main')?.scrollTo({ top: 0 });
}

export function AprovacoesScreen() {
  const [url, setUrl] = useUrlState(URL_SPEC);
  const busca = useDebouncedSearch(url.q, (q) => setUrl({ q }));
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const filtro: AprovFiltro = {
    q: url.q,
    ini: url.ini,
    fim: url.fim,
    tipo: url.tipo,
    status: url.status as AprovStatus | '',
  };
  const query = useAprovacoesPage(filtro, url.page);
  const pendentes = usePendentesCount();
  const aprovar = useAprovarMutation();
  const reabrir = useReabrirMutation();

  const limpar = () => {
    busca.reset('');
    setUrl({ q: '', ini: '', fim: '', tipo: '', status: '' });
  };

  return (
    <>
      <PageHeader
        title="Fila de Aprovação"
        description="Drivers registrados pelas áreas · histórico completo de decisões"
        actions={
          pendentes.data === undefined ? null : (
            <Badge tone="yellow" size="xl">
              {pluralPendentes(pendentes.data)}
            </Badge>
          )
        }
      />
      <ScreenDesc icon="✅">
        <strong>Ponto de curadoria humana entre o Driver Form e o Data Lake.</strong> Nenhum driver
        registrado pelas áreas entra no pipeline sem aprovação explícita.{' '}
        <em>Somente Planejadores e Administradores</em> podem aprovar ou rejeitar.
      </ScreenDesc>
      <AprovacoesFilters
        valores={{ ...filtro, busca: busca.value }}
        onBusca={busca.change}
        onChange={(patch) => setUrl(patch)}
      />
      {query.isPending ? (
        <ApsenLoader variant="content" label="Carregando aprovações…" />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <BusyRegion busy={query.isPlaceholderData}>
          <ResultSummary
            action={
              <Button variant="ghost" size="sm" onClick={limpar}>
                Limpar filtros
              </Button>
            }
          >
            <Resumo data={query.data} />
          </ResultSummary>
          {query.data.cards.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nenhum registro encontrado"
              description="Tente ajustar os filtros."
            />
          ) : (
            <ul aria-label="Fila de aprovação" className="m-0 p-0">
              {query.data.cards.map((card) => (
                <ApprovalCard
                  key={card.id}
                  card={card}
                  onAprovar={(id) => aprovar.mutate(id)}
                  onRejeitar={setRejeitando}
                  onReabrir={(id) => reabrir.mutate(id)}
                />
              ))}
            </ul>
          )}
          <Pagination
            variant="centered"
            page={url.page}
            totalPages={query.data.totalPages}
            onPageChange={(page) => {
              setUrl({ page });
              rolarParaOTopo();
            }}
          />
        </BusyRegion>
      )}
      {rejeitando === null ? null : (
        <RejeicaoModal id={rejeitando} onClose={() => setRejeitando(null)} />
      )}
    </>
  );
}
