import { PageHeader, TableSkeleton } from '@presentation/components/ui';
import { RestricaoVsDriverBanner } from './RestricaoVsDriverBanner';

const HEADERS = [
  'Tipo',
  'Descrição',
  'Produto / Linha',
  'Impacto',
  'Prazo',
  'Responsável',
  'Status',
  'Ações',
];

export function RestricoesSkeleton() {
  return (
    <>
      <PageHeader
        title="Restrições & Alertas"
        description="Impedimentos operacionais que afetam a execução do plano de produção"
      />
      <RestricaoVsDriverBanner />
      <div className="mb-[16px] flex border-b border-apsen-border">
        <span className="-mb-px border-b-2 border-apsen-red px-[20px] py-[9px] text-[13px] font-medium text-apsen-red">
          Ativas
        </span>
        <span className="px-[20px] py-[9px] text-[13px] text-apsen-muted">Resolvidas</span>
      </div>
      <TableSkeleton
        rows={6}
        columns={HEADERS.length}
        headers={HEADERS}
        label="Carregando restrições…"
      />
    </>
  );
}
