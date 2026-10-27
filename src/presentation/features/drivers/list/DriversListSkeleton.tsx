import { Skeleton } from '@presentation/components/ui';

export function DriversListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando registros…">
      <span className="sr-only">Carregando registros…</span>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="mb-[8px] rounded-[8px] border border-apsen-border bg-apsen-white px-[15px] py-[13px]"
        >
          <Skeleton className="mb-[8px] h-[16px] w-[90px]" />
          <Skeleton className="mb-[8px] h-[14px] w-3/5" />
          <Skeleton className="mb-[6px] h-[11px] w-2/5" />
          <Skeleton className="h-[11px] w-1/3" />
        </div>
      ))}
    </div>
  );
}
