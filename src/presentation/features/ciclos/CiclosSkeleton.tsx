import { Skeleton, TableSkeleton } from '@presentation/components/ui';

const HEADERS = ['Código', 'Descrição', 'Período', 'Drivers', 'Responsável', 'Status', 'Ações'];

export function CiclosSkeleton() {
  return (
    <div>
      <div className="mb-[18px]">
        <Skeleton className="h-[22px] w-[260px]" />
        <Skeleton className="mt-[6px] h-[14px] w-[420px]" />
      </div>
      <Skeleton className="mb-[18px] h-[74px] w-full" />
      <Skeleton className="mb-[16px] h-[40px] w-full" />
      <Skeleton className="mb-[12px] h-[14px] w-[180px]" />
      <TableSkeleton
        columns={HEADERS.length}
        headers={HEADERS}
        rows={3}
        label="Carregando ciclos…"
      />
    </div>
  );
}
