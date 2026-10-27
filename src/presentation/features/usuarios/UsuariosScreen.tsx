'use client';

import type { UsuarioRowDto } from '@application/usuarios/dto';
import {
  BusyRegion,
  ButtonLink,
  ConfirmDialog,
  ErrorState,
  PageHeader,
  Pagination,
  ScreenDesc,
  TableSkeleton,
} from '@presentation/components/ui';
import { USUARIO_NOVO_ROUTE } from '@presentation/navigation/routes';
import { useState } from 'react';
import {
  useDeleteUsuarioMutation,
  useToggleUsuarioMutation,
} from '../../hooks/usuarios/useUsuarioMutations';
import { useUsuariosPage } from '../../hooks/usuarios/useUsuarios';
import { UsuariosTable } from './components/UsuariosTable';
import { UsuariosToolbar } from './components/UsuariosToolbar';
import { useUsuariosFiltro } from './useUsuariosFiltro';

const HEADERS = ['Nome', 'E-mail', 'Perfil', 'Área', 'Pode registrar', 'Pode validar', 'Admin'];

function UsuariosResults() {
  const filtro = useUsuariosFiltro();
  const query = useUsuariosPage(filtro.filtro, { page: filtro.page });
  const toggle = useToggleUsuarioMutation();
  const remove = useDeleteUsuarioMutation();
  const [removendo, setRemovendo] = useState<UsuarioRowDto | null>(null);

  const confirmar = () => {
    if (removendo !== null) {
      remove.mutate(removendo.id);
    }
    setRemovendo(null);
  };

  return (
    <>
      <UsuariosToolbar
        busca={filtro.busca}
        onBusca={filtro.setBusca}
        perfil={filtro.perfil}
        onPerfil={filtro.setPerfil}
      />
      {query.isPending ? (
        <TableSkeleton columns={HEADERS.length} headers={HEADERS} rows={4} />
      ) : query.isError ? (
        <ErrorState
          message="Não foi possível carregar os usuários."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <BusyRegion busy={query.isPlaceholderData}>
          <p className="mb-[12px] text-[13px] text-apsen-muted">
            <strong>{query.data.resumo}</strong> cadastrados
          </p>
          <UsuariosTable
            rows={query.data.rows}
            onToggle={(row, ativo) => toggle.mutate({ id: row.id, ativo })}
            onRemove={setRemovendo}
            footer={
              query.data.totalPages > 1 ? (
                <Pagination
                  page={filtro.page}
                  totalPages={query.data.totalPages}
                  onPageChange={filtro.setPage}
                />
              ) : null
            }
          />
        </BusyRegion>
      )}
      <ConfirmDialog
        open={removendo !== null}
        title={`Remover o usuário "${removendo?.nome ?? ''}"?`}
        confirmLabel="Remover"
        onConfirm={confirmar}
        onCancel={() => setRemovendo(null)}
      />
    </>
  );
}

export function UsuariosScreen() {
  return (
    <>
      <PageHeader
        title="Usuários"
        description="Controle de acesso ao módulo Demand Intelligence"
        actions={
          <ButtonLink href={USUARIO_NOVO_ROUTE} variant="purple" size="sm">
            + Novo Usuário
          </ButtonLink>
        }
      />
      <ScreenDesc icon="👥">
        <strong>Gerencia quem pode registrar, revisar e administrar drivers.</strong> O modelo de
        perfis implementa o princípio de <em>menor privilégio</em>: Área (usuário) só registra;
        Planejador revisa e valida; Admin configura o catálogo, tipos e acesso. Cada ação no sistema
        é rastreada pelo usuário responsável.
      </ScreenDesc>
      <UsuariosResults />
    </>
  );
}
