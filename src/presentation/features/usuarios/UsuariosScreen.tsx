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
import { useSessao } from '../../hooks/useSessao';
import {
  useDeleteUsuarioMutation,
  useToggleUsuarioMutation,
} from '../../hooks/usuarios/useUsuarioMutations';
import { useUsuariosPage } from '../../hooks/usuarios/useUsuarios';
import { UsuariosTable } from './components/UsuariosTable';
import { UsuariosToolbar } from './components/UsuariosToolbar';
import { useUsuariosFiltro } from './useUsuariosFiltro';

const HEADERS = ['Nome', 'E-mail', 'Perfil', 'Área', 'Pode registrar', 'Pode validar', 'Admin'];

type Pendente = { acao: 'inativar' | 'remover'; row: UsuarioRowDto } | null;

export function confirmacaoTexto(pendente: NonNullable<Pendente>): string {
  return pendente.acao === 'remover'
    ? `Remover o usuário "${pendente.row.nome}"?`
    : `Inativar o usuário "${pendente.row.nome}"? Ele passará a ter acesso somente para visualização.`;
}

function UsuariosResults({ podeEscrever }: { podeEscrever: boolean }) {
  const filtro = useUsuariosFiltro();
  const query = useUsuariosPage(filtro.filtro, { page: filtro.page });
  const toggle = useToggleUsuarioMutation();
  const remove = useDeleteUsuarioMutation();
  const [pendente, setPendente] = useState<Pendente>(null);

  const confirmar = () => {
    if (pendente?.acao === 'remover') {
      remove.mutate(pendente.row.id);
    } else if (pendente?.acao === 'inativar') {
      toggle.mutate({ id: pendente.row.id, ativo: false });
    }
    setPendente(null);
  };

  const alternar = (row: UsuarioRowDto, ativo: boolean) => {
    if (ativo) {
      toggle.mutate({ id: row.id, ativo });
    } else {
      setPendente({ acao: 'inativar', row });
    }
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
            podeEscrever={podeEscrever}
            onToggle={alternar}
            onRemove={(row) => setPendente({ acao: 'remover', row })}
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
        open={pendente !== null}
        title="Tem certeza?"
        message={pendente === null ? undefined : confirmacaoTexto(pendente)}
        confirmLabel={pendente?.acao === 'inativar' ? 'Inativar' : 'Remover'}
        onConfirm={confirmar}
        onCancel={() => setPendente(null)}
      />
    </>
  );
}

export function UsuariosScreen() {
  const { podeEscrever } = useSessao();
  return (
    <>
      <PageHeader
        title="Usuários"
        description="Controle de acesso ao módulo Demand Intelligence"
        {...(podeEscrever
          ? {
              actions: (
                <ButtonLink href={USUARIO_NOVO_ROUTE} variant="purple" size="sm">
                  + Novo Usuário
                </ButtonLink>
              ),
            }
          : {})}
      />
      <ScreenDesc icon="👥">
        <strong>Gerencia quem pode registrar, revisar e administrar drivers.</strong> O modelo de
        perfis implementa o princípio de <em>menor privilégio</em>: Área (usuário) só registra;
        Planejador revisa e valida; Admin configura o catálogo, tipos e acesso. Cada ação no sistema
        é rastreada pelo usuário responsável.
      </ScreenDesc>
      <UsuariosResults podeEscrever={podeEscrever} />
    </>
  );
}
