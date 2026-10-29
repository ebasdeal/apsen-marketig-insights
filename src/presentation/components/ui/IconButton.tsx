'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePodeEscrever } from '../../hooks/usePodeEscrever';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonTone = 'blue' | 'red' | 'teal' | 'green';

const ICON_BUTTON =
  'inline-flex size-[28px] max-md:size-[44px] cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent transition-all duration-[130ms] focus-ring disabled:cursor-default disabled:opacity-[.3] disabled:hover:bg-transparent';

const TONES: Record<IconButtonTone, string> = {
  blue: 'text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue',
  red: 'text-apsen-muted hover:bg-apsen-red-bg hover:text-apsen-red',
  teal: 'text-apsen-muted hover:bg-apsen-teal-bg hover:text-apsen-teal',
  green: 'text-apsen-green-fg hover:bg-apsen-blue-bg',
};

function iconClasses(tone: IconButtonTone, className: string): string {
  return `${ICON_BUTTON} ${TONES[tone]} ${className}`.trim();
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  'aria-label': string;
  className?: string;
  tone?: IconButtonTone;
  escrita?: boolean;
}

export function IconButton({
  className = '',
  type = 'button',
  tone = 'blue',
  escrita = false,
  disabled,
  ...rest
}: IconButtonProps) {
  const podeEscrever = usePodeEscrever();
  return (
    <button
      type={type}
      className={iconClasses(tone, className)}
      disabled={disabled || (escrita && !podeEscrever)}
      {...rest}
    />
  );
}

interface IconLinkProps<T extends string> {
  href: Route<T>;
  'aria-label': string;
  children: ReactNode;
  className?: string;
  tone?: IconButtonTone;
}

export function IconLink<T extends string>({
  href,
  children,
  className = '',
  tone = 'blue',
  'aria-label': label,
}: IconLinkProps<T>) {
  return (
    <Link href={href} aria-label={label} className={iconClasses(tone, className)}>
      {children}
    </Link>
  );
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-[2px]">{children}</div>;
}
