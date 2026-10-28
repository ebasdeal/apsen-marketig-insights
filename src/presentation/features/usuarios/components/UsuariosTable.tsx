'use client';

import type { UsuarioRowDto } from '@application/usuarios/dto';
import { Badge, IconButton, IconLink, Table, type TableColumn } from '@presentation/components/ui';
import { usuarioEditarRoute } from '@presentation/navigation/routes';
import type { ReactNode } from 'react';
import { PencilIcon, TrashIcon } from './actionIcons';
import { PermissionCheck } from './PermissionCheck';
import { UsuarioStatusCell } from './UsuarioStatusCell';

interface UsuariosTableProps {
  rows: readonly UsuarioRowDto[];
  onToggle: (row: UsuarioRowDto, ativo: boolean) => void;
  onRemove: (row: UsuarioRowDto) => void;
  podeEscrever: boolean;
  footer?: ReactNode;
}

const CENTER = 'text-center';

function columns(
  onToggle: UsuariosTableProps['onToggle'],
  podeEscrever: boolean,
): TableColumn<UsuarioRowDto>[] {
  return [
    {
      key: 'nome',
      mobile: 'title',
      header: 'Nome',
      render: (row) => <div className="font-medium">{row.nome}</div>,
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (row) => <span className="text-[12px] text-apsen-muted">{row.email}</span>,
    },
    {
      key: 'perfil',
      header: 'Perfil',
      render: (row) => <Badge tone={row.perfilTone}>{row.perfilLabel}</Badge>,
    },
    {
      key: 'area',
      mobile: 'hidden',
      header: 'Área',
      render: (row) => <span className="text-[12px]">{row.area}</span>,
    },
    {
      key: 'registrar',
      mobile: 'hidden',
      header: 'Pode registrar',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.podeRegistrar} />,
    },
    {
      key: 'validar',
      mobile: 'hidden',
      header: 'Pode validar',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.podeValidar} />,
    },
    {
      key: 'admin',
      mobile: 'hidden',
      header: 'Admin',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.admin} />,
    },
    {
      key: 'acesso',
      mobile: 'hidden',
      header: 'Último acesso',
      render: (row) => <span className="text-[12px]">{row.ultimoAcesso}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <UsuarioStatusCell
          nome={row.nome}
          ativo={row.ativo}
          alteracao={row.alteracao}
          disabled={!podeEscrever}
          onChange={(ativo) => onToggle(row, ativo)}
        />
      ),
    },
  ];
}

export function UsuariosTable({
  rows,
  onToggle,
  onRemove,
  podeEscrever,
  footer,
}: UsuariosTableProps) {
  return (
    <Table
      caption="Usuários do módulo Demand Intelligence"
      columns={columns(onToggle, podeEscrever)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum usuário encontrado."
      footer={footer}
      actions={(row) => (
        <>
          <IconLink href={usuarioEditarRoute(row.id)} aria-label={`Editar ${row.nome}`}>
            <PencilIcon />
          </IconLink>
          {row.removivel && podeEscrever ? (
            <IconButton tone="red" aria-label={`Remover ${row.nome}`} onClick={() => onRemove(row)}>
              <TrashIcon />
            </IconButton>
          ) : null}
        </>
      )}
    />
  );
}
