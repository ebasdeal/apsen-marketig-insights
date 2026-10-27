import type { ReactNode } from 'react';

export const DEFAULT_LABEL = 'Carregando…';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-skeleton="block"
      className={`max-w-full rounded-[6px] bg-apsen-border motion-safe:animate-pulse ${className}`.trim()}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-[8px]">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={`h-[12px] ${index === lines - 1 ? 'w-3/5' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function LoadingRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function CardSkeletonBody({ lines }: { lines: number }) {
  return (
    <>
      <Skeleton className="mb-[16px] h-[14px] w-[180px]" />
      <SkeletonText lines={lines} />
    </>
  );
}

export function CardSkeleton({
  lines = 3,
  label = DEFAULT_LABEL,
}: {
  lines?: number;
  label?: string;
}) {
  return (
    <LoadingRegion label={label} className="surface">
      <CardSkeletonBody lines={lines} />
    </LoadingRegion>
  );
}

export function PageSkeleton({ label = DEFAULT_LABEL }: { label?: string }) {
  return (
    <LoadingRegion label={label}>
      <div className="mb-[18px]">
        <Skeleton className="h-[22px] w-[260px]" />
        <Skeleton className="mt-[6px] h-[14px] w-[360px]" />
      </div>
      <Skeleton className="mb-[18px] h-[58px] w-full" />
      <div className="surface">
        <CardSkeletonBody lines={4} />
      </div>
    </LoadingRegion>
  );
}
