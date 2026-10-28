'use client';

import type { CicloRowDto } from '@application/ciclos/dto';
import {
  ApsenLoader,
  BusyRegion,
  Button,
  ErrorState,
  PageHeader,
  Pagination,
} from '@presentation/components/ui';
import { useToggleCicloMutation } from '@presentation/hooks/ciclos/useCicloMutations';
import { useCiclosPage, useCiclosResumo } from '@presentation/hooks/ciclos/useCiclos';
import type { UrlStateSpec } from '@presentation/navigation/urlState';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { CicloModalMode } from './cicloForm';
import { ActiveCicloAlert } from './components/ActiveCicloAlert';
import { CiclosDesc } from './components/CiclosDesc';
import { CiclosSummary } from './components/CiclosSummary';
import { CiclosTable } from './components/CiclosTable';

const CicloModal = dynamic(() => import('./components/CicloModal').then((m) => m.CicloModal), {
  ssr: false,
});

export const CICLOS_PAGE_SIZE = 10;

const URL_SPEC = { page: { kind: 'int', default: 1, min: 1 } } satisfies UrlStateSpec;

export function CiclosScreen() {
  const [{ page }, setUrl] = useUrlState(URL_SPEC);
  const pageQuery = useCiclosPage({ page, size: CICLOS_PAGE_SIZE });
  const resumoQuery = useCiclosResumo();
  const toggle = useToggleCicloMutation();
  const pendingId = toggle.isPending ? (toggle.variables?.id ?? null) : null;
  const [modal, setModal] = useState<{ key: number; mode: CicloModalMode } | null>(null);
  const resumo = resumoQuery.data;
  const open = (mode: CicloModalMode) => setModal({ key: Date.now(), mode });
  const failed = pageQuery.isError || resumoQuery.isError;

  return (
    <>
      <PageHeader
        title="Ciclos de Planejamento"
        description="Períodos de planejamento de produção vinculados ao pipeline de drivers"
        actions={
          <Button
            variant="orange"
            size="sm"
            disabled={resumo === undefined}
            onClick={() => open({ modo: 'novo' })}
          >
            + Novo Ciclo
          </Button>
        }
      />
      <CiclosDesc />
      {failed ? (
        <ErrorState
          onRetry={() => {
            void pageQuery.refetch();
            void resumoQuery.refetch();
          }}
        />
      ) : pageQuery.data === undefined || resumo === undefined ? (
        <ApsenLoader variant="content" label="Carregando ciclos…" />
      ) : (
        <>
          <ActiveCicloAlert ativo={resumo.ativo} />
          <CiclosSummary total={pageQuery.data.total} ativos={resumo.ativos} />
          <BusyRegion busy={pageQuery.isPlaceholderData}>
            <CiclosTable
              rows={pageQuery.data.rows}
              pendingId={pendingId}
              onEdit={(ciclo: CicloRowDto) => open({ modo: 'editar', ciclo })}
              onToggle={(ciclo, ativo) => toggle.mutate({ id: ciclo.id, ativo })}
              footer={
                pageQuery.data.totalPages > 1 ? (
                  <Pagination
                    page={page}
                    totalPages={pageQuery.data.totalPages}
                    info={`Página ${page} de ${pageQuery.data.totalPages}`}
                    onPageChange={(next) => setUrl({ page: next })}
                  />
                ) : undefined
              }
            />
          </BusyRegion>
        </>
      )}
      {modal === null || resumo === undefined ? null : (
        <CicloModal
          key={modal.key}
          mode={modal.mode}
          resumo={resumo}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
