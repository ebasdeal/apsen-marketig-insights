import { LoadingRegion } from '@presentation/components/ui/Skeleton';

const BLOCO = 'rounded-[10px] bg-apsen-bg';

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Carregando dashboard…">
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} aria-hidden="true" className={`h-[118px] ${BLOCO}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-[16px] max-[800px]:grid-cols-1">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} aria-hidden="true" className={`h-[180px] ${BLOCO}`} />
        ))}
      </div>
    </LoadingRegion>
  );
}
