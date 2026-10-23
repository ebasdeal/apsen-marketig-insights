import type { Route } from 'next';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...rest} />;
}

interface ButtonLinkProps<T extends string> {
  href: Route<T>;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  'aria-label'?: string;
}

export function ButtonLink<T extends string>({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: ButtonLinkProps<T>) {
  return (
    <Link href={href} aria-label={ariaLabel} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
