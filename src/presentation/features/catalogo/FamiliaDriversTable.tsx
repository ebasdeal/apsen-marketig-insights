import type { FamiliaDriverRowDto } from '@application/catalogo/dto';
import type { NivelDriver } from '@domain/catalogo/nivel';
import Link from 'next/link';
import { EyeIcon } from '@presentation/components/ui';
import { CardTable, type CardTableColumn } from '../drivers/components/CardTable';
import { DriverTypeBadge } from '../drivers/components/DriverTypeBadge';
import { EditIcon } from '../drivers/components/driverIcons';
import { driverRoute, editarDriverRoute } from '../drivers/driverRoutes';

const NIVEL: Record<NivelDriver['tone'], string> = {
  sku: 'bg-apsen-blue-bg text-apsen-blue',
  franquia: 'bg-apsen-cyan-bg text-apsen-cyan',
  familia: 'bg-apsen-purple-soft text-apsen-purple',
};

const ACTION =
  'inline-flex items-center rounded-[6px] border border-apsen-border bg-transparent px-[8px] py-[5px] transition-all duration-[130ms] hover:bg-apsen-blue-bg focus-ring';

export function DriverLevelPill({ nivel }: { nivel: NivelDriver }) {
  return (
    <span className={`rounded-[8px] px-[8px] py-[2px] text-[10px] ${NIVEL[nivel.tone]}`}>
      {nivel.label}
    </span>
  );
}

function columns(familia: string): CardTableColumn<FamiliaDriverRowDto>[] {
  return [
    { key: 'tipo', header: 'Tipo', render: (row) => <DriverTypeBadge badge={row.badge} /> },
    {
      key: 'titulo',
      header: 'Título / Produto',
      render: (row) => (
        <>
          <div className="font-semibold text-apsen-slate">{row.titulo}</div>
          <div className="text-[11.5px] text-apsen-muted">{row.produto}</div>
        </>
      ),
    },
    {
      key: 'periodo',
      header: 'Período',
      render: (row) => <span className="text-[12px] text-apsen-muted">{row.periodo}</span>,
    },
    {
      key: 'nivel',
      header: 'Nível',
      center: true,
      render: (row) => <DriverLevelPill nivel={row.nivel} />,
    },
    {
      key: 'intensidade',
      header: 'Intens.',
      center: true,
      render: (row) => (
        <span
          className="text-[12px] text-apsen-star"
          aria-label={`Intensidade ${row.intensidade} de 5`}
        >
          {row.estrelas}
        </span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      center: true,
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="inline-flex gap-[4px]">
          <Link
            href={driverRoute(row.id, familia)}
            aria-label="Visualizar"
            className={`${ACTION} text-apsen-muted`}
          >
            <EyeIcon />
          </Link>
          <Link
            href={editarDriverRoute(row.id, familia)}
            aria-label="Editar"
            className={`${ACTION} text-apsen-blue`}
          >
            <EditIcon />
          </Link>
        </div>
      ),
    },
  ];
}

interface FamiliaDriversTableProps {
  familia: string;
  rows: readonly FamiliaDriverRowDto[];
}

export function FamiliaDriversTable({ familia, rows }: FamiliaDriversTableProps) {
  return (
    <CardTable
      caption={`Drivers da família ${familia}`}
      columns={columns(familia)}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText="Nenhum driver cadastrado para esta família"
    />
  );
}
