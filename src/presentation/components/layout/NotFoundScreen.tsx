'use client';

import { HOME_ROUTE } from '@presentation/navigation/routes';
import { matchScreen } from '@presentation/navigation/screens';
import { usePathname } from 'next/navigation';
import { ButtonLink } from '../ui/Button';
import { EmptyState, ErrorState } from '../ui/StateViews';

export function NotFoundScreen() {
  const pathname = usePathname();
  if (matchScreen(pathname) !== null) {
    return (
      <EmptyState
        icon="🔜"
        title="Em breve"
        description="Esta tela será disponibilizada em uma próxima entrega."
      />
    );
  }
  return (
    <ErrorState
      icon="🔍"
      title="Página não encontrada"
      message="O endereço acessado não existe ou foi removido."
      action={
        <ButtonLink href={HOME_ROUTE} variant="outline">
          ← Voltar ao Dashboard
        </ButtonLink>
      }
    />
  );
}
