'use client';

import type { IngeridoRowDto } from '@application/ingeridos/dto';
import {
  ApsenLoader,
  BusyRegion,
  Button,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import {
  useDeleteIngeridoMutation,
  useIngeridosPage,
} from '@presentation/hooks/ingeridos/useIngeridos';
import { useUrlState } from '@presentation/navigation/useUrlState';
import { useToast } from '@presentation/providers/ToastProvider';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useDebouncedSearch } from '../adminDi/useDebouncedSearch';
import { IngeridosTable } from './components/IngeridosTable';
import { IngeridosToolbar } from './components/IngeridosToolbar';

const IngeridoDetailModal = dynamic(() =>
  import('./components/IngeridoDetailModal').then((module) => module.IngeridoDetailModal),
);

const URL_SPEC = {
  q: { kind: 'string', default: '' },
  categoria: { kind: 'string', default: '' },
  page: { kind: 'int', default: 1, min: 1 },
} as const;

export function IngeridosScreen() {
  const [url, setUrl] = useUrlState(URL_SPEC);
  const busca = useDebouncedSearch(url.q, (q) => setUrl({ q }));
  const [vendo, setVendo] = useState<IngeridoRowDto | null>(null);
  const [removendo, setRemovendo] = useState<IngeridoRowDto | null>(null);
  const query = useIngeridosPage({ q: url.q, categoria: url.categoria }, url.page);
  const remove = useDeleteIngeridoMutation();
  const toast = useToast();

  const confirmarRemocao = () => {
    if (removendo !== null) remove.mutate(removendo.id);
    setRemovendo(null);
  };

  return (
    <>
      <PageHeader
        title="Drivers Ingeridos"
        description="Data Lake · status Validado · alimentam o ApsenPLPEngine"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.show('📊 Exportando para ML Engine...')}
          >
            Exportar para ML Engine
          </Button>
        }
      />
      <ScreenDesc icon="💾">
        <strong>Drivers validados e disponíveis para o ApsenPLPEngine.</strong> Tudo aqui foi curado
        por um analista — origem rastreada (área ou agente), feature engineering mapeada. É o{' '}
        <em>histórico de contexto causal</em>: ao analisar um desvio de forecast, o analista
        consulta esta tela para checar quais eventos estavam ativos no período.
      </ScreenDesc>
      <IngeridosToolbar
        busca={busca.value}
        categoria={url.categoria}
        onBusca={busca.change}
        onCategoria={(categoria) => setUrl({ categoria })}
      />
      {query.isPending ? (
        <ApsenLoader variant="content" label="Carregando ingeridos…" />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <BusyRegion busy={query.isPlaceholderData}>
          <p className="mb-[12px] text-[13px] text-apsen-muted">
            <strong>{query.data.resumo}</strong>{' '}
            {query.data.resumo.startsWith('1 ') ? 'ingerido' : 'ingeridos'} no Data Lake
          </p>
          <IngeridosTable
            rows={query.data.rows}
            onVer={setVendo}
            onRemover={setRemovendo}
            footer={
              query.data.totalPages > 1 ? (
                <Pagination
                  page={url.page}
                  totalPages={query.data.totalPages}
                  info={`Página ${url.page} de ${query.data.totalPages}`}
                  onPageChange={(page) => setUrl({ page })}
                />
              ) : null
            }
          />
        </BusyRegion>
      )}
      {vendo === null ? null : (
        <IngeridoDetailModal ingerido={vendo} onClose={() => setVendo(null)} />
      )}
      <ConfirmDialog
        open={removendo !== null}
        title={`Remover o driver ${removendo?.id ?? ''} da ingestão?`}
        description="O driver deixa de alimentar o ApsenPLPEngine."
        confirmLabel="Remover"
        onConfirm={confirmarRemocao}
        onCancel={() => setRemovendo(null)}
      />
    </>
  );
}
