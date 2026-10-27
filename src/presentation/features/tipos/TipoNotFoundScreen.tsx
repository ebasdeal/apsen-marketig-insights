import { ButtonLink, ErrorState } from '@presentation/components/ui';
import { TIPOS_ROUTE } from '@presentation/navigation/routes';

export function TipoNotFoundScreen() {
  return (
    <ErrorState
      icon="🔍"
      title="Tipo não encontrado"
      message="O tipo procurado não existe ou foi removido do catálogo."
      action={
        <ButtonLink href={TIPOS_ROUTE} variant="outline">
          ← Voltar ao Catálogo
        </ButtonLink>
      }
    />
  );
}
