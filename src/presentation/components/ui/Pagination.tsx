'use client';

import { PAGE_SIZES } from '@domain/shared/Page';
import { paginationItems } from './pageRange';
import { PageSizeSelect } from './PageSizeSelect';
import { PaginationCentered } from './PaginationCentered';

const BUTTON =
  'size-[28px] cursor-pointer rounded-full border text-[13px] focus-ring disabled:cursor-default disabled:opacity-[.35]';
const IDLE = 'border-apsen-border bg-apsen-white font-normal text-apsen-slate';
const ACTIVE = 'border-apsen-blue bg-apsen-blue font-semibold text-white';

export type PaginationVariant = 'range' | 'centered';

interface PaginationProps {
  page: number;
  totalPages: number;
  info?: string;
  onPageChange: (page: number) => void;
  variant?: PaginationVariant;
  layout?: 'split' | 'centered';
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  info,
  onPageChange,
  variant,
  layout,
  pageSize,
  pageSizeOptions = PAGE_SIZES,
  onPageSizeChange,
}: PaginationProps) {
  const sizeSelect =
    onPageSizeChange === undefined ? null : (
      <PageSizeSelect
        pageSize={pageSize ?? pageSizeOptions[0] ?? 10}
        options={pageSizeOptions}
        onChange={onPageSizeChange}
      />
    );
  if ((variant ?? (layout === 'centered' ? 'centered' : 'range')) === 'centered') {
    return (
      <PaginationCentered
        page={page}
        totalPages={totalPages}
        info={info ?? `Página ${page} de ${totalPages}`}
        onPageChange={onPageChange}
        sizeSelect={sizeSelect}
      />
    );
  }
  return (
    <nav
      aria-label="Paginação"
      className="mt-[4px] flex flex-wrap items-center justify-between gap-[8px] border-t border-apsen-border py-[14px]"
    >
      <div aria-live="polite" className="text-[13px] text-apsen-muted">
        {info}
      </div>
      <div className="flex items-center gap-[4px]">
        {sizeSelect}
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`${BUTTON} ${IDLE}`}
        >
          ‹
        </button>
        {paginationItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="px-[4px] text-apsen-muted"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Página ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={`${BUTTON} ${item === page ? ACTIVE : IDLE}`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${BUTTON} ${IDLE}`}
        >
          ›
        </button>
      </div>
    </nav>
  );
}
