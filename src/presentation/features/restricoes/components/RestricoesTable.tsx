import type { RestricaoItemOutput, RestricoesAba } from '@application/restricoes/dto';
import { Badge, IconButton, Table, type TableColumn } from '@presentation/components/ui';
import { CheckIcon, PencilIcon } from '@presentation/components/ui/rowActionIcons';
import type { ReactNode } from 'react';
import { IMPACTO_COR, prazoCor } from '../restricaoStyles';
import { SeveridadePill } from './SeveridadePill';

interface RestricoesTableProps {
  aba: RestricoesAba;
  itens: readonly RestricaoItemOutput[];
  onEditar: (item: RestricaoItemOutput) => void;
  onResolver: (item: RestricaoItemOutput) => void;
  footer?: ReactNode;
}

const COLUMNS: readonly TableColumn<RestricaoItemOutput>[] = [
  {
    key: 'tipo',
    header: 'Tipo',
    render: (r) => (
      <span className="whitespace-nowrap rounded-[10px] border border-apsen-border bg-apsen-bg px-[9px] py-[2px] text-[11.5px] font-semibold">
        {r.label}
      </span>
    ),
  },
  {
    key: 'desc',
    mobile: 'title',
    wrap: true,
    header: 'Descrição',
    render: (r) => (
      <>
        <div className="text-[13px] font-medium">{r.desc}</div>
        <div className="text-[11.5px] text-apsen-muted">{r.det}</div>
      </>
    ),
  },
  {
    key: 'produto',
    mobile: 'hidden',
    wrap: true,
    header: 'Produto / Linha',
    className: 'text-[12.5px]',
    render: (r) => r.produto,
  },
  {
    key: 'impacto',
    header: 'Impacto',
    render: (r) => (
      <span className={`text-[12px] font-semibold ${IMPACTO_COR[r.impCor]}`}>{r.impacto}</span>
    ),
  },
  {
    key: 'prazo',
    header: 'Prazo',
    render: (r) => (
      <span className={`whitespace-nowrap text-[12.5px] ${prazoCor(r.sev)}`}>{r.prazo}</span>
    ),
  },
  { key: 'resp', header: 'Responsável', className: 'text-[12.5px]', render: (r) => r.resp },
  {
    key: 'status',
    header: 'Status',
    render: (r) =>
      r.status === 'ativa' ? (
        <SeveridadePill sev={r.sev} label={r.sevLabel} />
      ) : (
        <Badge tone="green">✅ Resolvida</Badge>
      ),
  },
];

export function RestricoesTable({
  aba,
  itens,
  onEditar,
  onResolver,
  footer,
}: RestricoesTableProps) {
  const acoes = (r: RestricaoItemOutput) =>
    r.status === 'ativa' ? (
      <>
        <IconButton aria-label={`Editar ${r.desc}`} title="Editar" onClick={() => onEditar(r)}>
          <PencilIcon />
        </IconButton>
        <IconButton
          escrita
          tone="green"
          aria-label={`Marcar ${r.desc} como resolvida`}
          title="Resolvida"
          onClick={() => onResolver(r)}
        >
          <CheckIcon />
        </IconButton>
      </>
    ) : (
      <small className="text-apsen-muted">{r.resolucaoResumo}</small>
    );
  return (
    <Table
      caption={aba === 'ativas' ? 'Restrições ativas' : 'Restrições resolvidas'}
      columns={COLUMNS}
      rows={itens}
      rowKey={(r) => r.id}
      compact
      emptyText="Nenhum registro"
      actions={acoes}
      footer={footer}
    />
  );
}
