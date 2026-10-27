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
  footer?: ReactNode;
}

const CENTER = 'text-center';

function columns(onToggle: UsuariosTableProps['onToggle']): TableColumn<UsuarioRowDto>[] {
  return [
    { key: 'nome', header: 'Nome', render: (row) => <div className="font-medium">{row.nome}</div> },
    {
      key: 'email',
      header: 'E-mail',
      className: 'text-[12px] text-apsen-muted',
      render: (row) => row.email,
    },
    {
      key: 'perfil',
      header: 'Perfil',
      render: (row) => <Badge tone={row.perfilTone}>{row.perfilLabel}</Badge>,
    },
    { key: 'area', header: 'Área', className: 'text-[12px]', render: (row) => row.area },
    {
      key: 'registrar',
      header: 'Pode registrar',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.podeRegistrar} />,
    },
    {
      key: 'validar',
      header: 'Pode validar',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.podeValidar} />,
    },
    {
      key: 'admin',
      header: 'Admin',
      className: CENTER,
      render: (row) => <PermissionCheck value={row.admin} />,
    },
    {
      key: 'acesso',
      header: 'Último acesso',
      className: 'text-[12px]',
      render: (row) => row.ultimoAcesso,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <UsuarioStatusCell
          nome={row.nome}
          ativo={row.ativo}
          onChange={(ativo) => onToggle(row, ativo)}
        />
      ),
    },
  ];
}

export function UsuariosTable({ rows, onToggle, onRemove, footer }: UsuariosTableProps) {
  return (
    <Table
      caption="Usuários do módulo Demand Intelligence"
      columns={columns(onToggle)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum usuário encontrado."
      footer={footer}
      actions={(row) => (
        <>
          <IconLink href={usuarioEditarRoute(row.id)} aria-label={`Editar ${row.nome}`}>
            <PencilIcon />
          </IconLink>
          {row.removivel ? (
            <IconButton tone="red" aria-label={`Remover ${row.nome}`} onClick={() => onRemove(row)}>
              <TrashIcon />
            </IconButton>
          ) : null}
        </>
      )}
    />
  );
}
