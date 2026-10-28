import { ButtonLink, ErrorState } from '@presentation/components/ui';
import { PLANOS_ROUTE } from '../planoRoutes';

export function PlanoItemNotFound() {
  return (
    <ErrorState
      icon="🔍"
      title="Item não encontrado"
      message="O item do plano solicitado não existe ou foi removido."
      action={
        <ButtonLink href={PLANOS_ROUTE} variant="outline">
          ← Voltar para Planos
        </ButtonLink>
      }
    />
  );
}
