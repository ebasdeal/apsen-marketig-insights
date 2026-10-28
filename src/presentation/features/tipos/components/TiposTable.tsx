'use client';

import type { TipoRowDto } from '@application/tipos/dto';
import {
  CodeTag,
  IconButton,
  IconLink,
  Table,
  Toggle,
  type TableColumn,
} from '@presentation/components/ui';
import { tipoEditarRoute } from '@presentation/navigation/routes';
import type { ReactNode } from 'react';
import { EditIcon, TrashIcon } from '../../adminDi/adminIcons';
import { CamposHeader, FeatureHeader, LagHeader, TipoSlugHeader } from './TipoHeaderTooltips';

interface TiposTableProps {
  rows: readonly TipoRowDto[];
  footer: ReactNode;
  onToggle: (row: TipoRowDto, ativo: boolean) => void;
  onDelete: (row: TipoRowDto) => void;
}

function columns(onToggle: TiposTableProps['onToggle']): TableColumn<TipoRowDto>[] {
  return [
    {
      key: 'tipo',
      mobile: 'title',
      label: 'Tipo',
      wrap: true,
      header: <TipoSlugHeader />,
      render: (row) => (
        <>
          <div className="text-[13px] font-medium">{row.label}</div>
          <div className="font-mono text-[11px] text-apsen-muted">{row.slug}</div>
        </>
      ),
    },
    {
      key: 'cat',
      header: 'Categoria',
      render: (row) => (
        <span className="whitespace-nowrap rounded-[4px] border border-apsen-border bg-apsen-bg px-[8px] py-[2px] text-[11.5px] font-semibold">
          {row.catL}
        </span>
      ),
    },
    { key: 'dono', header: 'Dono de Área', className: 'text-[12.5px]!', render: (row) => row.dono },
    {
      key: 'feature',
      label: 'Feature',
      header: <FeatureHeader />,
      render: (row) => <CodeTag tone={row.featureTone}>{row.feature}</CodeTag>,
    },
    {
      key: 'lag',
      label: 'Lag',
      header: <LagHeader />,
      className: 'text-center font-mono text-[13px]',
      render: (row) => row.lagTxt,
    },
    {
      key: 'params',
      label: 'Campos',
      header: <CamposHeader />,
      className: 'text-center text-[13px] font-semibold text-apsen-blue',
      render: (row) => row.params,
    },
    {
      key: 'ativo',
      header: 'Ativo',
      render: (row) => (
        <Toggle
          checked={row.ativo}
          aria-label={`Tipo ${row.slug} ativo`}
          onChange={(ativo) => onToggle(row, ativo)}
        />
      ),
    },
  ];
}

export function TiposTable({ rows, footer, onToggle, onDelete }: TiposTableProps) {
  return (
    <Table
      caption="Catálogo de tipos de driver"
      columns={columns(onToggle)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum tipo nesta categoria."
      footer={footer}
      actions={(row) => (
        <>
          <IconLink
            href={tipoEditarRoute(row.id)}
            tone="teal"
            aria-label={`Editar tipo ${row.slug}`}
          >
            <EditIcon />
          </IconLink>
          <IconButton
            tone="red"
            aria-label={`Excluir tipo ${row.slug}`}
            onClick={() => onDelete(row)}
          >
            <TrashIcon />
          </IconButton>
        </>
      )}
    />
  );
}
