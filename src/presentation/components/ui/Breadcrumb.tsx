import type { Route } from 'next';
import { Fragment } from 'react';
import { ButtonLink } from './Button';
import { ChevronRightIcon } from './icons';
import { TextLink } from './TextLink';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  linkVariant?: 'table' | 'crumb';
}

export function Breadcrumb({
  items,
  backHref,
  backLabel = '← Voltar',
  linkVariant = 'table',
}: BreadcrumbProps) {
  return (
    <>
      <nav
        aria-label="Trilha da página"
        className="mb-[10px] flex flex-wrap items-center gap-[5px] text-[12.5px] text-apsen-muted"
      >
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index === 0 ? null : <ChevronRightIcon className="size-[11px]" />}
            {item.href === undefined ? (
              <span aria-current="page" className="font-medium text-apsen-slate">
                {item.label}
              </span>
            ) : (
              <TextLink href={item.href as Route} variant={linkVariant}>
                {item.label}
              </TextLink>
            )}
          </Fragment>
        ))}
      </nav>
      {backHref === undefined ? null : (
        <ButtonLink
          href={backHref as Route}
          variant="outline"
          size="sm"
          className="mb-[16px] min-h-[32px]"
        >
          {backLabel}
        </ButtonLink>
      )}
    </>
  );
}
