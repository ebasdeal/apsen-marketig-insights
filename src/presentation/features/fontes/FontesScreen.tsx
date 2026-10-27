'use client';

import type { FonteCardDto } from '@application/fontes/dto';
import {
  BusyRegion,
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { useDeleteFonteMutation } from '@presentation/hooks/fontes/useFonteMutations';
import { useFontesPage } from '@presentation/hooks/fontes/useFontes';
import type { UrlStateSpec } from '@presentation/navigation/urlState';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FontesList } from './components/FontesList';
import type { FonteModalMode } from './fonteForm';

const FonteModal = dynamic(() => import('./components/FonteModal').then((m) => m.FonteModal), {
  ssr: false,
});

export const FONTES_PAGE_SIZE = 10;

const URL_SPEC = { page: { kind: 'int', default: 1, min: 1 } } satisfies UrlStateSpec;

export function FontesScreen() {
  const [{ page }, setUrl] = useUrlState(URL_SPEC);
  const query = useFontesPage({ page, size: FONTES_PAGE_SIZE });
  const remove = useDeleteFonteMutation();
  const [modal, setModal] = useState<{ key: number; mode: FonteModalMode } | null>(null);
  const [removing, setRemoving] = useState<FonteCardDto | null>(null);
  const open = (mode: FonteModalMode) => setModal({ key: Date.now(), mode });
  const data = query.data;

  return (
    <>
      <PageHeader
        title="Fontes de Dados / APIs"
        description="Configuração de integrações externas · Admin DI"
        actions={
          <Button variant="primary" size="sm" onClick={() => open({ modo: 'nova' })}>
            + Nova Fonte de Dados
          </Button>
        }
      />
      <ScreenDesc icon="🔌">
        <strong>Configure as APIs que alimentam os campos de busca do sistema.</strong> Quando
        ativas, os campos de autocomplete (concorrentes, laboratórios, moléculas) consultam a fonte
        configurada em tempo real, em vez de usar a lista interna.{' '}
        <em>As alterações valem para todos os formulários.</em>
      </ScreenDesc>
      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : data === undefined ? (
        <LoadingState />
      ) : (
        <BusyRegion busy={query.isPlaceholderData}>
          <FontesList
            items={data.items}
            onConfigure={(fonte) => open({ modo: 'config', fonte })}
            onRemove={setRemoving}
          />
          {data.totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              info={`Página ${page} de ${data.totalPages}`}
              onPageChange={(next) => setUrl({ page: next })}
            />
          ) : null}
        </BusyRegion>
      )}
      {modal === null ? null : (
        <FonteModal key={modal.key} mode={modal.mode} onClose={() => setModal(null)} />
      )}
      <ConfirmDialog
        open={removing !== null}
        title={removing === null ? '' : `Remover a fonte "${removing.nome}"?`}
        confirmLabel="Remover"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing !== null) remove.mutate({ id: removing.id, removivel: removing.removivel });
          setRemoving(null);
        }}
      />
    </>
  );
}
