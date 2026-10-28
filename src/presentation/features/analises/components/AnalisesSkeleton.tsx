import { CardSkeleton, Skeleton } from '@presentation/components/ui';
import { LoadingRegion } from '@presentation/components/ui/Skeleton';

function Cabecalho() {
  return (
    <div className="mb-[18px]">
      <Skeleton className="h-[22px] w-[200px]" />
      <Skeleton className="mt-[6px] h-[14px] w-[320px]" />
    </div>
  );
}

export function AnalisesListSkeleton() {
  return (
    <LoadingRegion label="Carregando análises…">
      <Cabecalho />
      <Skeleton className="mb-[18px] h-[58px] w-full" />
      <Skeleton className="mb-[14px] h-[34px] w-full" />
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="mb-[10px] h-[64px] w-full rounded-[10px]" />
      ))}
    </LoadingRegion>
  );
}

export function NovaAnaliseSkeleton() {
  return (
    <LoadingRegion label="Carregando nova análise…">
      <Skeleton className="mb-[16px] h-[14px] w-[180px]" />
      <Skeleton className="mb-[18px] h-[58px] w-full" />
      {[4, 3, 2, 3].map((linhas, index) => (
        <CardSkeleton key={index} lines={linhas} />
      ))}
    </LoadingRegion>
  );
}

export function AnaliseViewSkeleton() {
  return (
    <LoadingRegion label="Carregando análise…">
      <Skeleton className="mb-[10px] h-[14px] w-[220px]" />
      <Cabecalho />
      <div className="grid grid-cols-[1fr_360px] items-start gap-[16px] max-[1100px]:grid-cols-1">
        <div>
          {['h-[90px]', 'h-[120px]', 'h-[320px]', 'h-[110px]'].map((altura) => (
            <Skeleton key={altura} className={`mb-[12px] w-full rounded-[10px] ${altura}`} />
          ))}
        </div>
        <Skeleton className="h-[440px] w-full rounded-[10px]" />
      </div>
    </LoadingRegion>
  );
}
