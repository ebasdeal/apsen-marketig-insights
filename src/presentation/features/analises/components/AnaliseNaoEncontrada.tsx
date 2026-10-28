import { ButtonLink, ErrorState } from '@presentation/components/ui';
import { ANALISES_ROUTE } from '../../../navigation/routes';

export function AnaliseNaoEncontrada() {
  return (
    <ErrorState
      icon="🔍"
      title="Análise não encontrada"
      message="A análise pode ter sido removida ou o endereço está incorreto."
      action={
        <ButtonLink href={ANALISES_ROUTE} variant="outline">
          ← Voltar para Análises
        </ButtonLink>
      }
    />
  );
}
