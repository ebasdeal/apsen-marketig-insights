import type { CatalogRowDto } from '@application/catalogo/dto';
import Link from 'next/link';
import { CardTable, type CardTableColumn } from '../drivers/components/CardTable';
import { ChartIcon } from '../drivers/components/driverIcons';
import { catalogoFamiliaRoute } from '../drivers/driverRoutes';
import { FranquiaPill } from './FranquiaPill';

const COLUMNS: readonly CardTableColumn<CatalogRowDto>[] = [
  {
    key: 'franquia',
    mobile: 'field',
    header: 'Franquia',
    render: (row) => <FranquiaPill franquia={row.franquia} />,
  },
  {
    key: 'familia',
    mobile: 'title',
    header: 'Família',
    render: (row) => <span className="font-medium text-apsen-slate">{row.familia}</span>,
  },
  {
    key: 'skus',
    mobile: 'field',
    header: 'SKUs',
    center: true,
    render: (row) => <span className="text-apsen-muted">{row.nSkus}</span>,
  },
  {
    key: 'drivers',
    header: 'Drivers',
    center: true,
    render: (row) =>
      row.nDrivers > 0 ? (
        <span className="inline-flex items-center whitespace-nowrap rounded-[20px] bg-apsen-blue-bg px-[10px] py-[2px] text-[12px] font-semibold text-apsen-blue">
          {row.nDrivers}
        </span>
      ) : (
        <span className="text-[12px] text-apsen-muted">0</span>
      ),
  },
  {
    key: 'acoes',
    header: 'Ações',
    center: true,
    render: (row) => (
      <Link
        href={catalogoFamiliaRoute(row.familia)}
        title="Ver drivers desta família"
        aria-label={`Ver drivers da família ${row.familia}`}
        className="inline-flex items-center gap-[5px] rounded-[7px] border border-apsen-border bg-transparent px-[10px] py-[5px] text-[12px] text-apsen-blue transition-all duration-[130ms] hover:bg-apsen-blue-bg focus-ring"
      >
        <ChartIcon />
        Drivers
      </Link>
    ),
  },
];

export function CatalogTable({ rows }: { rows: readonly CatalogRowDto[] }) {
  return (
    <CardTable
      caption="Famílias do catálogo de produtos"
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => row.familia}
      emptyText="Nenhuma família encontrada com os filtros atuais."
    />
  );
}
