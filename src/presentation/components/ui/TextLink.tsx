import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type TextLinkVariant = 'table' | 'code' | 'more' | 'crumb';

const VARIANTS: Record<TextLinkVariant, string> = {
  table: 'cursor-pointer font-medium text-apsen-blue hover:underline focus-ring',
  code: 'cursor-pointer font-mono text-[12px] font-semibold text-apsen-blue focus-ring',
  more: 'cursor-pointer text-[12px] text-apsen-blue focus-ring',
  crumb: 'cursor-pointer text-apsen-blue focus-ring',
};

interface TextLinkProps<T extends string> {
  href: Route<T>;
  children: ReactNode;
  variant?: TextLinkVariant;
  className?: string;
  'aria-label'?: string;
}

export function TextLink<T extends string>({
  href,
  children,
  variant = 'table',
  className = '',
  'aria-label': ariaLabel,
}: TextLinkProps<T>) {
  return (
    <Link href={href} aria-label={ariaLabel} className={`${VARIANTS[variant]} ${className}`.trim()}>
      {children}
    </Link>
  );
}
