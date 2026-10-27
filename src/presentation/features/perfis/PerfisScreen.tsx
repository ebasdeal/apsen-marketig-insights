'use client';

import {
  Card,
  CardTitle,
  ErrorState,
  InlineEmpty,
  PageHeader,
  ScreenDesc,
  SkeletonText,
} from '@presentation/components/ui';
import { usePermissoes } from '../../hooks/usuarios/useUsuarios';
import { PermissionMatrix } from './components/PermissionMatrix';

function MatrizContent() {
  const query = usePermissoes();
  if (query.isPending) {
    return (
      <div role="status" aria-label="Carregando…">
        <SkeletonText lines={8} />
      </div>
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar as permissões."
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (query.data.grupos.length === 0) {
    return <InlineEmpty>Nenhuma permissão cadastrada.</InlineEmpty>;
  }
  return <PermissionMatrix matriz={query.data} />;
}

export function PerfisScreen() {
  return (
    <>
      <PageHeader title="Perfis de Acesso" description="Matriz de permissões por perfil" />
      <ScreenDesc icon="🔐">
        <strong>Define o que cada perfil pode ver e fazer no módulo.</strong> Quatro perfis fixos
        com permissões crescentes. <em>Área</em> só registra drivers das suas categorias
        autorizadas. <em>Planejador</em> revisa e valida. <em>Admin</em> configura tipos, acesso e
        exporta dados para o modelo.
      </ScreenDesc>
      <Card>
        <CardTitle>Matriz de Permissões</CardTitle>
        <MatrizContent />
      </Card>
    </>
  );
}
