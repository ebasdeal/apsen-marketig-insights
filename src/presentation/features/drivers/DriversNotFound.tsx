import { ButtonLink, ErrorState } from '@presentation/components/ui';
import { CATALOGO_ROUTE, DRIVERS_ROUTE } from './driverRoutes';

export function DriverNotFound() {
  return (
    <ErrorState
      icon="🔍"
      title="Driver não encontrado"
      action={
        <ButtonLink variant="outline" href={DRIVERS_ROUTE}>
          ← Voltar aos registros
        </ButtonLink>
      }
    />
  );
}

export function FamiliaNotFound() {
  return (
    <ErrorState
      icon="🔍"
      title="Família não encontrada"
      action={
        <ButtonLink variant="outline" href={CATALOGO_ROUTE}>
          ← Voltar ao catálogo
        </ButtonLink>
      }
    />
  );
}
