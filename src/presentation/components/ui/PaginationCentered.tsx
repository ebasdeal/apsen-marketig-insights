'use client';

import type { ReactNode } from 'react';
import { paginationItems } from './pageRange';

const BUTTON =
  'flex h-[30px] min-w-[30px] cursor-pointer items-center justify-center border-0 font-[inherit] focus-ring';
const IDLE = 'bg-transparent text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue';
const ACTIVE = 'bg-apsen-blue font-semibold text-white';
const NAV =
  'rounded-[6px] px-[8px] text-[14px] disabled:cursor-default disabled:opacity-[.35] disabled:hover:bg-transparent disabled:hover:text-apsen-muted';

interface PaginationCenteredProps {
  page: number;
  totalPages: number;
  info: string;
  onPageChange: (page: number) => void;
  sizeSelect: ReactNode;
}

export function PaginationCentered({
  page,
  totalPages,
  info,
  onPageChange,
  sizeSelect,
}: PaginationCenteredProps) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-center gap-[5px] pt-[16px] pb-[2px]"
    >
      {sizeSelect}
      <span aria-live="polite" className="mr-[6px] text-[12px] text-apsen-muted">
        {info}
      </span>
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${BUTTON} ${IDLE} ${NAV}`}
      >
        ‹
      </button>
      {paginationItems(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="flex h-[30px] min-w-[30px] items-center justify-center text-[13px] text-apsen-muted"
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
            className={`${BUTTON} rounded-full text-[13px] ${item === page ? ACTIVE : IDLE}`}
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
        className={`${BUTTON} ${IDLE} ${NAV}`}
      >
        ›
      </button>
    </nav>
  );
}
