import { Skeleton } from '@presentation/components/ui';

export function FontesSkeleton() {
  return (
    <div role="status" aria-label="Carregando fontes…" aria-busy="true">
      <span className="sr-only">Carregando fontes…</span>
      <div className="mb-[18px]">
        <Skeleton className="h-[22px] w-[240px]" />
        <Skeleton className="mt-[6px] h-[14px] w-[340px]" />
      </div>
      <Skeleton className="mb-[18px] h-[58px] w-full" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="mb-[12px] flex items-start gap-[14px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[18px] py-[16px] shadow-apsen-sm"
        >
          <Skeleton className="size-[28px] shrink-0" />
          <div className="flex flex-1 flex-col gap-[8px]">
            <Skeleton className="h-[14px] w-[260px]" />
            <Skeleton className="h-[12px] w-full" />
          </div>
          <Skeleton className="h-[26px] w-[110px] shrink-0" />
        </div>
      ))}
    </div>
  );
}
