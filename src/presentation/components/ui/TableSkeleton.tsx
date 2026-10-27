import { DEFAULT_LABEL, LoadingRegion, Skeleton } from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns: number;
  label?: string;
  headers?: readonly string[];
}

export function TableSkeleton({
  rows = 10,
  columns,
  label = DEFAULT_LABEL,
  headers,
}: TableSkeletonProps) {
  const cells = Array.from({ length: columns }, (_, index) => index);
  return (
    <LoadingRegion
      label={label}
      className="overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm"
    >
      <div className="flex h-[38px] min-w-[560px] items-center gap-[14px] border-b border-apsen-border bg-apsen-bg px-[14px]">
        {cells.map((cell) =>
          headers?.[cell] === undefined ? (
            <Skeleton key={cell} className="h-[10px] flex-1" />
          ) : (
            <span
              key={cell}
              aria-hidden="true"
              className="flex-1 truncate text-[11.5px] font-semibold text-apsen-muted"
            >
              {headers[cell]}
            </span>
          ),
        )}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          data-skeleton="row"
          className="flex h-[45px] min-w-[560px] items-center gap-[14px] border-b border-apsen-bg px-[14px] last:border-b-0"
        >
          {cells.map((cell) => (
            <Skeleton key={cell} className="h-[12px] flex-1" />
          ))}
        </div>
      ))}
    </LoadingRegion>
  );
}
