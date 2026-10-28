'use client';

import type { DriverForFormDto, DriverFormLookupsDto } from '@application/drivers/dto';
import { draftDeDriver, draftInicial, type DriverDraft } from '@domain/drivers/draft';
import { NotFoundError } from '@domain/shared/DomainError';
import { ApsenLoader, ErrorState } from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useFamiliaSkus } from '@presentation/hooks/catalogo/useProdutoSkus';
import { useDriverForForm } from '@presentation/hooks/drivers/useDriverForForm';
import { useDriverFormLookups } from '@presentation/hooks/drivers/useDriverFormLookups';
import { notFound } from 'next/navigation';
import { catalogoFamiliaRoute, DRIVERS_ROUTE } from '../driverRoutes';
import { DriverForm } from './DriverForm';
import { DriverFormHeader } from './DriverFormHeader';
import type { FormMode } from './formTypes';

interface DriverFormScreenProps {
  mode: FormMode;
  driverId?: string | undefined;
  familia?: string | undefined;
}

function draftDe(
  lookups: DriverFormLookupsDto,
  form: DriverForFormDto | undefined,
  familia: string | undefined,
): DriverDraft {
  if (form === undefined) {
    return draftInicial({
      intensidades: lookups.intensidades,
      canaisDefault: lookups.config.canaisDefault,
      ...(familia === undefined ? {} : { familia }),
    });
  }
  return draftDeDriver(form.driver, {
    sku: form.sku,
    familia: form.familia,
    categorias: lookups.categorias,
    camposPorTipo: lookups.camposPorTipo,
    intensidades: lookups.intensidades,
  });
}

export function DriverFormScreen({ mode, driverId, familia }: DriverFormScreenProps) {
  const novo = mode === 'new';
  const lookups = useDriverFormLookups();
  const form = useDriverForForm(novo ? undefined : driverId);
  const contexto = useFamiliaSkus(novo ? (familia ?? '') : '');

  if (!novo && (driverId === undefined || form.error instanceof NotFoundError)) {
    notFound();
  }
  const carregando =
    lookups.isPending ||
    (!novo && form.isPending) ||
    (novo && familia !== undefined && contexto.isPending);
  const erro = lookups.error ?? (novo ? null : form.error);
  if (erro !== null) {
    return (
      <ErrorState
        message={toUserMessage(erro)}
        onRetry={() => {
          void lookups.refetch();
          if (!novo) void form.refetch();
        }}
      />
    );
  }
  if (carregando || lookups.data === undefined) {
    return <ApsenLoader variant="content" label="Carregando formulário…" />;
  }

  const familiaValida = novo ? ((contexto.data?.length ?? 0) > 0 ? familia : undefined) : familia;
  const destino = familiaValida === undefined ? DRIVERS_ROUTE : catalogoFamiliaRoute(familiaValida);

  return (
    <>
      <DriverFormHeader mode={mode} driverId={driverId} familia={familiaValida} />
      <DriverForm
        mode={mode}
        lookups={lookups.data}
        inicial={draftDe(lookups.data, form.data, novo ? familiaValida : undefined)}
        original={form.data?.driver}
        destino={destino}
      />
    </>
  );
}
