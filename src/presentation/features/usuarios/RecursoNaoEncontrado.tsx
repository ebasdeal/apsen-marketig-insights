import { ButtonLink, ErrorState } from '@presentation/components/ui';
import type { Route } from 'next';

interface RecursoNaoEncontradoProps {
  title: string;
  message: string;
  backHref: Route;
}

export function RecursoNaoEncontrado({ title, message, backHref }: RecursoNaoEncontradoProps) {
  return (
    <ErrorState
      icon="🔍"
      title={title}
      message={message}
      action={
        <ButtonLink href={backHref} variant="outline">
          ← Voltar
        </ButtonLink>
      }
    />
  );
}
