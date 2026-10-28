'use client';

import { NotFoundError } from '@domain/shared/DomainError';
import {
  ApsenLoader,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useFamiliaDrivers } from '@presentation/hooks/catalogo/useFamiliaDrivers';
import type { UrlStateSpec } from '@presentation/navigation/urlState';
import { useUrlState } from '@presentation/navigation/useUrlState';
import { notFound } from 'next/navigation';
import { CATALOGO_ROUTE, novoDriverRoute } from '../drivers/driverRoutes';
import { lastPage, pageInfo } from '../drivers/pageParams';
import { FamiliaDriversTable } from './FamiliaDriversTable';

const SPEC = { page: { kind: 'int', default: 1, min: 1 } } as const satisfies UrlStateSpec;

export const FAMILIA_PAGE_SIZE = 10;

export function FamiliaDriversScreen({ familia }: { familia: string }) {
  const query = useFamiliaDrivers(familia);
  const [params, setParams] = useUrlState(SPEC);

  if (query.error instanceof NotFoundError) {
    notFound();
  }
  if (query.isPending) {
    return <ApsenLoader variant="content" label="Carregando drivers da família…" />;
  }
  if (query.isError) {
    return <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />;
  }

  const data = query.data;
  const total = data.drivers.length;
  const ultima = lastPage(total, FAMILIA_PAGE_SIZE);
  const page = Math.min(params.page, ultima);
  const rows = data.drivers.slice((page - 1) * FAMILIA_PAGE_SIZE, page * FAMILIA_PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={`Drivers — ${data.familia}`}
        meta={
          <>
            Franquia <strong>{data.franquia}</strong> · Família <strong>{data.familia}</strong> ·{' '}
            {total} driver(s) cadastrado(s)
          </>
        }
        actions={
          <>
            <ButtonLink variant="ghost" size="sm" href={CATALOGO_ROUTE}>
              ← Voltar ao catálogo
            </ButtonLink>
            <ButtonLink variant="primary" size="sm" href={novoDriverRoute(data.familia)}>
              + Cadastrar novo driver
            </ButtonLink>
          </>
        }
      />
      <ScreenDesc icon="🎯">
        <strong>Drivers cadastrados para esta família.</strong> Visualize os detalhes de cada
        driver, edite os existentes ou cadastre um novo — a família já vem preenchida
        automaticamente.
      </ScreenDesc>
      {total === 0 ? (
        <Card>
          <EmptyState
            icon="📭"
            title="Nenhum driver cadastrado para esta família"
            description='Clique em "Cadastrar novo driver" para registrar o primeiro.'
          />
        </Card>
      ) : (
        <FamiliaDriversTable familia={data.familia} rows={rows} />
      )}
      {total > FAMILIA_PAGE_SIZE ? (
        <Pagination
          page={page}
          totalPages={ultima}
          info={pageInfo(page, FAMILIA_PAGE_SIZE, total)}
          onPageChange={(next) => setParams({ page: next })}
        />
      ) : null}
    </>
  );
}
