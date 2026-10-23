import { ButtonLink, ErrorState } from '@presentation/components/ui';

export default function NotFound() {
  return (
    <ErrorState
      icon="🔍"
      title="Página não encontrada"
      message="O endereço acessado não existe ou foi removido."
      action={
        <ButtonLink href="/" variant="outline">
          ← Voltar ao Dashboard
        </ButtonLink>
      }
    />
  );
}
