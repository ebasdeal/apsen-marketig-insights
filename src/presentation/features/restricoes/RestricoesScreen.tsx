'use client';

import type {
  ContagemRestricoesOutput,
  RestricaoItemOutput,
  RestricoesAba,
} from '@application/restricoes/dto';
import { pageCountOf } from '@domain/shared/Page';
import {
  BusyRegion,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  Tabs,
  type TabItem,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useContagemRestricoes, useRestricoes } from '@presentation/hooks/restricoes/useRestricoes';
import { useResolverRestricaoMutation } from '@presentation/hooks/restricoes/useRestricaoMutations';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { RestricaoVsDriverBanner } from './components/RestricaoVsDriverBanner';
import { RestricoesTable } from './components/RestricoesTable';
import { RESTRICOES_URL_SPEC } from './restricoesUrl';

const RestricaoModal = dynamic(() => import('./components/RestricaoModal'), { ssr: false });

function abasDe(contagem: ContagemRestricoesOutput | undefined): TabItem<RestricoesAba>[] {
  const ativas: TabItem<RestricoesAba> = { value: 'ativas', label: 'Ativas', tone: 'red' };
  const resolvidas: TabItem<RestricoesAba> = {
    value: 'resolvidas',
    label: 'Resolvidas',
    tone: 'blue',
  };
  if (contagem === undefined) return [ativas, resolvidas];
  return [
    { ...ativas, count: contagem.ativas },
    { ...resolvidas, count: contagem.resolvidas },
  ];
}

type ModalState = { item: RestricaoItemOutput | null } | null;

function intervalo(pagina: number, tamanho: number, total: number): string {
  const inicio = (pagina - 1) * tamanho + 1;
  if (inicio > total) return `Mostrando 0–0 de ${total}`;
  return `Mostrando ${inicio}–${Math.min(pagina * tamanho, total)} de ${total}`;
}

export function RestricoesScreen() {
  const [url, setUrl] = useUrlState(RESTRICOES_URL_SPEC);
  const input = { aba: url.aba as RestricoesAba, pagina: url.pagina };
  const lista = useRestricoes(input);
  const contagem = useContagemRestricoes();
  const resolver = useResolverRestricaoMutation(input);
  const [modal, setModal] = useState<ModalState>(null);

  const tabs = abasDe(contagem.data);

  return (
    <>
      <PageHeader
        title="Restrições & Alertas"
        description="Impedimentos operacionais que afetam a execução do plano de produção"
        actions={
          <Button escrita variant="red" size="sm" onClick={() => setModal({ item: null })}>
            + Registrar Restrição
          </Button>
        }
      />
      <RestricaoVsDriverBanner />
      <Tabs
        id="restricoes-tabs"
        aria-label="Situação das restrições"
        items={tabs}
        value={input.aba}
        onChange={(aba) => setUrl({ aba, pagina: 1 })}
      >
        <RestricoesPainel
          estado={lista}
          aba={input.aba}
          onPagina={(pagina) => setUrl({ pagina })}
          onEditar={(item) => setModal({ item })}
          onResolver={(item) => resolver.mutate(item.id)}
        />
      </Tabs>
      {modal === null ? null : <RestricaoModal item={modal.item} onClose={() => setModal(null)} />}
    </>
  );
}

interface PainelProps {
  estado: ReturnType<typeof useRestricoes>;
  aba: RestricoesAba;
  onPagina: (pagina: number) => void;
  onEditar: (item: RestricaoItemOutput) => void;
  onResolver: (item: RestricaoItemOutput) => void;
}

function RestricoesPainel({ estado, aba, onPagina, onEditar, onResolver }: PainelProps) {
  if (estado.isError && estado.data === undefined) {
    return (
      <ErrorState message={toUserMessage(estado.error)} onRetry={() => void estado.refetch()} />
    );
  }
  if (estado.data === undefined) {
    return <LoadingState label="Carregando restrições…" />;
  }
  const { itens, total, pagina, tamanho } = estado.data;
  const paginacao = (
    <Pagination
      page={pagina}
      totalPages={pageCountOf(total, tamanho)}
      info={intervalo(pagina, tamanho, total)}
      onPageChange={onPagina}
    />
  );
  if (itens.length === 0) {
    return (
      <>
        <EmptyState icon={aba === 'ativas' ? '✅' : '📋'} title="Nenhum registro" />
        {total > 0 ? paginacao : null}
      </>
    );
  }
  return (
    <BusyRegion busy={estado.isPlaceholderData}>
      <RestricoesTable
        aba={aba}
        itens={itens}
        onEditar={onEditar}
        onResolver={onResolver}
        footer={paginacao}
      />
    </BusyRegion>
  );
}
