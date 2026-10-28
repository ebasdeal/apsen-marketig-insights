'use client';

import type { IngeridoRowDto } from '@application/ingeridos/dto';
import {
  CategoryTag,
  CodeTag,
  EyeIcon,
  IconButton,
  Table,
  type TableColumn,
} from '@presentation/components/ui';
import type { ReactNode } from 'react';
import { TrashIcon } from '../../adminDi/adminIcons';
import { ID_TONE } from './ingeridoTones';

interface IngeridosTableProps {
  rows: readonly IngeridoRowDto[];
  footer: ReactNode;
  onVer: (row: IngeridoRowDto) => void;
  onRemover: (row: IngeridoRowDto) => void;
}

const COLUMNS: TableColumn<IngeridoRowDto>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => (
      <span className={`font-mono text-[12px] ${ID_TONE[row.idTone]}`}>{row.id}</span>
    ),
  },
  {
    key: 'produto',
    mobile: 'title',
    wrap: true,
    header: 'Produto',
    render: (row) => (
      <>
        <div className="font-medium">{row.produto}</div>
        <div className="text-[11px] text-apsen-muted">{row.sku}</div>
      </>
    ),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (row) => <CategoryTag tone={row.badge}>{row.tipo}</CategoryTag>,
  },
  { key: 'periodo', header: 'Período', className: 'text-[12px]!', render: (row) => row.periodo },
  {
    key: 'feature',
    mobile: 'hidden',
    header: 'Feature',
    render: (row) => <CodeTag tone={row.featureTone}>{row.feature}</CodeTag>,
  },
  {
    key: 'area',
    mobile: 'hidden',
    header: 'Área',
    className: 'text-[12px]!',
    render: (row) => row.area,
  },
  {
    key: 'validadoPor',
    header: 'Validado por',
    className: 'text-[12px]!',
    render: (row) => row.validadoPor,
  },
];

export function IngeridosTable({ rows, footer, onVer, onRemover }: IngeridosTableProps) {
  return (
    <Table
      caption="Drivers ingeridos no Data Lake"
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum driver ingerido encontrado."
      footer={footer}
      actions={(row) => (
        <>
          <IconButton aria-label={`Ver ${row.id}`} onClick={() => onVer(row)}>
            <EyeIcon className="size-[14px]" />
          </IconButton>
          <IconButton tone="red" aria-label={`Remover ${row.id}`} onClick={() => onRemover(row)}>
            <TrashIcon />
          </IconButton>
        </>
      )}
    />
  );
}
