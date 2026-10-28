'use client';

import type { DriverListItemDto } from '@application/drivers/dto';
import {
  ApsenLoader,
  BusyRegion,
  ButtonLink,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useDeleteDriverMutation } from '@presentation/hooks/drivers/useDeleteDriverMutation';
import { useDrivers } from '@presentation/hooks/drivers/useDrivers';
import { useUrlState } from '@presentation/navigation/useUrlState';
import { useEffect, useState } from 'react';
import { NOVO_DRIVER_ROUTE } from '../driverRoutes';
import { lastPage, PAGE_SIZE_SELECTOR_MIN, PAGE_SPEC, pageInfo } from '../pageParams';
import { DriverListItem } from './DriverListItem';

function EmptyList() {
  return (
    <div className="state-block">
      <div aria-hidden="true" className="mb-[10px] text-[36px]">
        📋
      </div>
      <p className="mb-[4px] text-[13.5px] font-medium text-apsen-slate">Nenhum registro ainda</p>
      <small className="text-[12px]">
        Vá para <strong>Registrar Driver</strong> e adicione o primeiro driver.
      </small>
    </div>
  );
}

export function DriversListScreen() {
  const [params, setParams] = useUrlState(PAGE_SPEC);
  const size = Number(params.size);
  const query = useDrivers({ page: params.page, size });
  const remove = useDeleteDriverMutation();
  const [pendente, setPendente] = useState<DriverListItemDto | null>(null);
  const data = query.data;
  const ultima = data === undefined ? 1 : lastPage(data.total, size);

  useEffect(() => {
    if (data !== undefined && !query.isPlaceholderData && data.total > 0 && params.page > ultima) {
      setParams({ page: ultima });
    }
  }, [data, query.isPlaceholderData, params.page, ultima, setParams]);

  function confirmar() {
    if (pendente !== null) {
      remove.mutate(pendente.id);
    }
    setPendente(null);
  }

  return (
    <>
      <PageHeader
        title="Meus Registros"
        description="Drivers cadastrados nesta sessão"
        actions={
          <ButtonLink variant="outline" size="sm" href={NOVO_DRIVER_ROUTE}>
            + Novo Driver
          </ButtonLink>
        }
      />
      <ScreenDesc icon="📋">
        <strong>Lista de todos os drivers registrados nesta sessão.</strong> Revise os dados antes
        de exportar. Cada item vai para o pipeline de ingestão do Data Lake, onde o{' '}
        <em>FeatureEngineer</em> do ApsenPLPEngine transformará o driver em variável exógena para o
        modelo.
      </ScreenDesc>
      {query.isPending ? <ApsenLoader variant="content" label="Carregando registros…" /> : null}
      {query.isError ? (
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : null}
      {data !== undefined && data.total === 0 ? <EmptyList /> : null}
      {data !== undefined && data.total > 0 ? (
        <BusyRegion busy={query.isPlaceholderData}>
          <ul aria-label="Drivers registrados">
            {data.items.map((item) => (
              <DriverListItem key={item.id} item={item} onRemove={setPendente} />
            ))}
          </ul>
          {data.total > size ? (
            <Pagination
              page={params.page}
              totalPages={ultima}
              info={pageInfo(params.page, size, data.total)}
              onPageChange={(page) => setParams({ page })}
              pageSize={size}
              {...(data.total > PAGE_SIZE_SELECTOR_MIN
                ? { onPageSizeChange: (next: number) => setParams({ size: String(next) }) }
                : {})}
            />
          ) : null}
        </BusyRegion>
      ) : null}
      <ConfirmDialog
        open={pendente !== null}
        title="Remover registro"
        message={pendente === null ? '' : `Remover o registro ${pendente.titulo}?`}
        confirmLabel="Remover"
        onCancel={() => setPendente(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
