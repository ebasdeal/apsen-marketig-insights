'use client';

import {
  BusyRegion,
  ErrorState,
  PageHeader,
  Pagination,
  ResultSummary,
  ScreenDesc,
  TableSkeleton,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useCatalogFamilias } from '@presentation/hooks/catalogo/useCatalogFamilias';
import { useCatalogFilters } from '@presentation/hooks/catalogo/useCatalogFilters';
import { PAGE_SIZES } from '@domain/shared/Page';
import { PageSizeSelect } from '@presentation/components/ui/PageSizeSelect';
import { lastPage, pageInfo } from '../drivers/pageParams';
import { CatalogFilters } from './CatalogFilters';
import { CatalogTable } from './CatalogTable';
import { useCatalogParams } from './useCatalogParams';

export const CATALOG_HEADERS = ['Franquia', 'Família', 'SKUs', 'Drivers', 'Ações'];

export function CatalogScreen() {
  const filtros = useCatalogFilters();
  const params = useCatalogParams(filtros.data);
  const { query } = params;
  const lista = useCatalogFamilias(query);
  const data = lista.data;

  return (
    <>
      <PageHeader
        title="Catálogo de Produtos"
        description="Franquias e famílias cadastradas · Drivers por produto"
      />
      <ScreenDesc icon="📚">
        <strong>
          Consulte as franquias e famílias do catálogo Apsen e os drivers já registrados para cada
          uma.
        </strong>{' '}
        Use os filtros para localizar uma franquia ou família. Clique no ícone de drivers de uma
        linha para ver todos os drivers cadastrados para aquela família e seus SKUs.
      </ScreenDesc>
      <CatalogFilters
        busca={params.busca}
        onBusca={params.setBusca}
        franquia={query.franquia}
        onFranquia={params.setFranquia}
        familia={query.familia}
        onFamilia={params.setFamilia}
        filtros={filtros.data}
      />
      {lista.isPending ? (
        <TableSkeleton columns={5} headers={CATALOG_HEADERS} label="Carregando catálogo…" />
      ) : null}
      {lista.isError && data === undefined ? (
        <ErrorState message={toUserMessage(lista.error)} onRetry={() => void lista.refetch()} />
      ) : null}
      {data === undefined ? null : (
        <BusyRegion busy={lista.isPlaceholderData}>
          <ResultSummary
            action={
              <PageSizeSelect
                pageSize={query.size}
                options={PAGE_SIZES}
                onChange={params.setSize}
              />
            }
          >
            <strong className="text-apsen-slate">{data.total}</strong>{' '}
            {data.total === 1 ? 'família' : 'famílias'} no catálogo
          </ResultSummary>
          <CatalogTable rows={data.rows} />
          {data.total > query.size ? (
            <Pagination
              page={query.page}
              totalPages={lastPage(data.total, query.size)}
              info={pageInfo(query.page, query.size, data.total)}
              onPageChange={params.setPage}
            />
          ) : null}
        </BusyRegion>
      )}
    </>
  );
}
