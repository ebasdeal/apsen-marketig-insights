import { Skeleton } from '@presentation/components/ui';

function CardBlocks({ fields }: { fields: number }) {
  return (
    <div className="surface">
      <Skeleton className="mb-[16px] h-[16px] w-[220px]" />
      <div className="grid grid-cols-3 gap-[13px] max-[560px]:grid-cols-1">
        {Array.from({ length: fields }, (_, index) => (
          <Skeleton key={index} className="h-[38px] w-full bg-apsen-bg" />
        ))}
      </div>
    </div>
  );
}

export function DriverFormSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando formulário…">
      <span className="sr-only">Carregando formulário…</span>
      <div className="mb-[18px]">
        <Skeleton className="h-[22px] w-[280px]" />
        <Skeleton className="mt-[6px] h-[14px] w-[420px]" />
      </div>
      <Skeleton className="mb-[18px] h-[58px] w-full" />
      <CardBlocks fields={6} />
      <CardBlocks fields={2} />
    </div>
  );
}
