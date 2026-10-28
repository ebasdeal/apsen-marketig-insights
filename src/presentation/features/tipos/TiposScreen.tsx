'use client';

import type { ListTiposResult, TipoRowDto } from '@application/tipos/dto';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@domain/shared/Page';
import { isCategoriaSlug } from '@domain/tipos/Tipo';
import { TIPO_CAT_FILTERS, type TipoCatFiltro } from '@domain/tipos/vocabulario';
import {
  ApsenLoader,
  BusyRegion,
  Button,
  ButtonLink,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import {
  useDeleteTipoMutation,
  useToggleTipoMutation,
} from '@presentation/hooks/tipos/useTipoMutations';
import { useTiposPage } from '@presentation/hooks/tipos/useTipos';
import { TIPO_NOVO_ROUTE } from '@presentation/navigation/routes';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { TiposTable } from './components/TiposTable';

const ImportCatalogoModal = dynamic(() =>
  import('./components/ImportCatalogoModal').then((module) => module.ImportCatalogoModal),
);

const URL_SPEC = {
  cat: { kind: 'enum', default: 'all', values: TIPO_CAT_FILTERS.map((filtro) => filtro.value) },
  page: { kind: 'int', default: 1, min: 1 },
  size: { kind: 'int', default: DEFAULT_PAGE_SIZE, min: 1 },
} as const;

function pageSizeOf(size: number): number {
  return (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE;
}

function TiposResumo({ data }: { data: ListTiposResult }) {
  return (
    <p className="mb-[12px] text-[13px] text-apsen-muted">
      <strong>
        {data.filtrados} de {data.total} tipos
      </strong>{' '}
      cadastrados · <span className="font-medium text-apsen-green-fg">{data.ativos} ativos</span>
    </p>
  );
}

function rangeInfo(page: number, size: number, total: number): string {
  if (total === 0) return '0 tipos';
  const inicio = (page - 1) * size + 1;
  return `${inicio}–${Math.min(page * size, total)} de ${total} tipos`;
}

export function TiposScreen() {
  const [url, setUrl] = useUrlState(URL_SPEC);
  const [importando, setImportando] = useState(false);
  const [excluir, setExcluir] = useState<TipoRowDto | null>(null);
  const size = pageSizeOf(url.size);
  const cat = isCategoriaSlug(url.cat) ? url.cat : undefined;
  const query = useTiposPage(
    cat === undefined ? { page: url.page, size } : { page: url.page, size, cat },
  );
  const toggle = useToggleTipoMutation();
  const remove = useDeleteTipoMutation();

  const confirmarExclusao = () => {
    if (excluir !== null) remove.mutate({ id: excluir.id, slug: excluir.slug });
    setExcluir(null);
  };

  return (
    <>
      <PageHeader
        title="Catálogo de Tipos de Driver"
        description="Define quais tipos estão disponíveis no Driver Form · Feature engineering configurável"
        actions={
          <>
            <Button escrita variant="ghost" size="sm" onClick={() => setImportando(true)}>
              Importar JSON
            </Button>
            <ButtonLink href={TIPO_NOVO_ROUTE} variant="teal" size="sm">
              + Novo Tipo
            </ButtonLink>
          </>
        }
      />
      <ScreenDesc icon="📚">
        <strong>Vocabulário controlado de drivers disponíveis no formulário das áreas.</strong> Cada
        tipo define: campos do formulário, método de <em>feature engineering</em> (dummy, contínua,
        censurada, Fourier), lag padrão e dono de área. Tipos inativos somem do formulário mas
        preservam histórico. É a ponte entre o conhecimento de negócio e a engenharia do modelo
        causal.
      </ScreenDesc>
      <div className="mb-[14px]">
        <ChipGroup<TipoCatFiltro>
          label="Filtrar por categoria"
          hideLabel
          options={TIPO_CAT_FILTERS}
          selected={cat ?? 'all'}
          onSelect={(value) => setUrl({ cat: value })}
        />
      </div>
      {query.isPending ? (
        <ApsenLoader variant="content" label="Carregando tipos…" />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <BusyRegion busy={query.isPlaceholderData}>
          <TiposResumo data={query.data} />
          <TiposTable
            rows={query.data.rows}
            onToggle={(row, ativo) => toggle.mutate({ id: row.id, slug: row.slug, ativo })}
            onDelete={setExcluir}
            footer={
              <Pagination
                page={url.page}
                totalPages={query.data.totalPages}
                info={rangeInfo(url.page, size, query.data.filtrados)}
                onPageChange={(page) => setUrl({ page })}
                pageSize={size}
                onPageSizeChange={(novo) => setUrl({ size: novo })}
              />
            }
          />
        </BusyRegion>
      )}
      {importando ? <ImportCatalogoModal onClose={() => setImportando(false)} /> : null}
      <ConfirmDialog
        open={excluir !== null}
        title={`Remover o tipo "${excluir?.slug ?? ''}"?`}
        description="O tipo some do Driver Form; drivers já registrados mantêm o slug."
        confirmLabel="Remover"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluir(null)}
      />
    </>
  );
}
