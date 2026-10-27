import type { Route } from 'next';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  dashed?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
}

function extraClasses(dashed: boolean, className: string): string {
  return `${dashed ? 'border-dashed ' : ''}${className}`.trim();
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  dashed = false,
  loading = false,
  loadingLabel = 'Salvando…',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, extraClasses(dashed, className))}
      disabled={loading || disabled}
      aria-busy={loading ? true : undefined}
      {...rest}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}

interface ButtonLinkProps<T extends string> {
  href: Route<T>;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  dashed?: boolean;
  'aria-label'?: string;
}

export function ButtonLink<T extends string>({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dashed = false,
  'aria-label': ariaLabel,
}: ButtonLinkProps<T>) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={buttonClasses(variant, size, extraClasses(dashed, className))}
    >
      {children}
    </Link>
  );
}
