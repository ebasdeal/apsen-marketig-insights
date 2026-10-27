import { CardSkeleton, Skeleton, TableSkeleton } from '@presentation/components/ui';

function HeaderSkeleton() {
  return (
    <div aria-hidden="true" className="mb-[18px]">
      <Skeleton className="h-[22px] w-[260px]" />
      <Skeleton className="mt-[6px] h-[14px] w-[380px]" />
      <Skeleton className="mt-[18px] h-[58px] w-full" />
    </div>
  );
}

export function TabelaPageSkeleton({ columns, rows = 10 }: { columns: number; rows?: number }) {
  return (
    <>
      <HeaderSkeleton />
      <Skeleton className="mb-[14px] h-[30px] w-3/4" />
      <TableSkeleton columns={columns} rows={rows} />
    </>
  );
}

export function FormPageSkeleton() {
  return (
    <>
      <Skeleton className="mb-[16px] h-[14px] w-[200px]" />
      <HeaderSkeleton />
      <div className="flex flex-col gap-[16px]">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={3} />
      </div>
    </>
  );
}

export function CardsPageSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <Skeleton className="mb-[16px] h-[70px] w-full" />
      <div className="flex flex-col gap-[14px]">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </>
  );
}
