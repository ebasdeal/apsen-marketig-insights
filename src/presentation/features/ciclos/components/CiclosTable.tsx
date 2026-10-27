'use client';

import type { CicloRowDto } from '@application/ciclos/dto';
import {
  EyeIcon,
  IconButton,
  IconLink,
  Table,
  type TableColumn,
} from '@presentation/components/ui';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { CicloStatusCell } from './CicloStatusCell';
import { PencilIcon, TrashIcon } from './cicloIcons';

const INGERIDOS_ROUTE = '/admin/ingeridos' as Route;

interface CiclosTableProps {
  rows: readonly CicloRowDto[];
  pendingId: string | null;
  onEdit: (ciclo: CicloRowDto) => void;
  onToggle: (ciclo: CicloRowDto, ativo: boolean) => void;
  footer?: ReactNode;
}

function codigoClass(ciclo: CicloRowDto): string {
  return ciclo.status === 'ativo' ? 'font-bold text-apsen-orange' : 'text-apsen-muted';
}

function columns(
  pendingId: string | null,
  onToggle: CiclosTableProps['onToggle'],
): TableColumn<CicloRowDto>[] {
  return [
    {
      key: 'codigo',
      header: 'Código',
      render: (row) => (
        <span className={`font-mono text-[12px] ${codigoClass(row)}`}>{row.codigo}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row) => (
        <>
          <div className="font-medium">{row.descricao}</div>
          <div className="text-[11.5px] text-apsen-muted">{row.meta}</div>
        </>
      ),
    },
    {
      key: 'periodo',
      header: 'Período',
      className: 'text-[12.5px] whitespace-nowrap',
      render: (row) => row.periodo,
    },
    {
      key: 'drivers',
      header: 'Drivers',
      render: (row) => (
        <>
          <div className="text-[13px] font-semibold text-apsen-blue">{row.drivers}</div>
          <div className="text-[11px] text-apsen-muted">ingeridos</div>
        </>
      ),
    },
    {
      key: 'responsavel',
      header: 'Responsável',
      className: 'text-[12.5px]',
      render: (row) => row.responsavel,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <CicloStatusCell ciclo={row} pending={pendingId === row.id} onToggle={onToggle} />
      ),
    },
  ];
}

export function CiclosTable({ rows, pendingId, onEdit, onToggle, footer }: CiclosTableProps) {
  return (
    <Table
      caption="Ciclos de planejamento"
      columns={columns(pendingId, onToggle)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum ciclo cadastrado."
      rowClassName={(row) => (row.status === 'ativo' ? 'bg-apsen-row-active' : '')}
      footer={footer}
      actions={(row) => (
        <>
          {row.status === 'encerrado' ? null : (
            <IconButton
              aria-label={`Editar ciclo ${row.codigo}`}
              title="Editar"
              onClick={() => onEdit(row)}
            >
              <PencilIcon />
            </IconButton>
          )}
          <IconLink href={INGERIDOS_ROUTE} aria-label={`Ver drivers do ciclo ${row.codigo}`}>
            <EyeIcon />
          </IconLink>
          {row.status === 'ativo' ? (
            <IconButton
              aria-label={`Excluir ciclo ${row.codigo}`}
              title="Ciclo ativo — não pode excluir"
              disabled
              className="cursor-not-allowed! opacity-30"
            >
              <TrashIcon />
            </IconButton>
          ) : null}
        </>
      )}
    />
  );
}
