import { CardSkeleton, PageHeader, Skeleton, TableSkeleton } from '@presentation/components/ui';

const HEADERS = [
  '',
  'Código',
  'Produto / Apresentação',
  'Família',
  'Qtd. Planejada',
  'Linha',
  'Semana Prod.',
  'Status',
  'Ações',
];

export function PlanosSkeleton() {
  return (
    <>
      <PageHeader
        title="Planos de Produção"
        description="Lista e gerencia todos os itens programados para produção no ciclo ativo"
      />
      <Skeleton className="mb-[18px] h-[86px] w-full" />
      <div className="mb-[12px] flex gap-[10px]">
        <Skeleton className="h-[33px] flex-1" />
        <Skeleton className="h-[33px] w-[180px]" />
        <Skeleton className="h-[33px] w-[170px]" />
      </div>
      <TableSkeleton
        rows={8}
        columns={HEADERS.length}
        headers={HEADERS}
        label="Carregando itens do plano…"
      />
    </>
  );
}

export function PlanoItemSkeleton() {
  return (
    <>
      <Skeleton className="mb-[10px] h-[14px] w-[240px]" />
      <Skeleton className="mb-[16px] h-[26px] w-[90px]" />
      <div className="grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1">
        <CardSkeleton lines={4} label="Carregando item do plano…" />
        <CardSkeleton lines={4} label="Carregando programação…" />
      </div>
      <CardSkeleton lines={3} label="Carregando status…" />
    </>
  );
}
