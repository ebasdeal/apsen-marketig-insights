import type { Route } from 'next';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const ICON_BUTTON =
  'inline-flex size-[28px] cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent text-apsen-muted transition-all duration-[130ms] hover:bg-apsen-blue-bg hover:text-apsen-blue focus-ring';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  'aria-label': string;
  className?: string;
}

export function IconButton({ className = '', type = 'button', ...rest }: IconButtonProps) {
  return <button type={type} className={`${ICON_BUTTON} ${className}`.trim()} {...rest} />;
}

interface IconLinkProps<T extends string> {
  href: Route<T>;
  'aria-label': string;
  children: ReactNode;
  className?: string;
}

export function IconLink<T extends string>({
  href,
  children,
  className = '',
  'aria-label': label,
}: IconLinkProps<T>) {
  return (
    <Link href={href} aria-label={label} className={`${ICON_BUTTON} ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-[2px]">{children}</div>;
}
