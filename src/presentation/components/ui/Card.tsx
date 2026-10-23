import type { ReactNode } from 'react';

export type CardElement = 'div' | 'section' | 'article' | 'li';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: CardElement;
}

export function Card({ children, className = '', as: Element = 'div' }: CardProps) {
  return <Element className={`surface ${className}`.trim()}>{children}</Element>;
}

interface CardTitleProps {
  children: ReactNode;
  small?: ReactNode;
}

export function CardTitle({ children, small }: CardTitleProps) {
  return (
    <div className="mb-[16px] flex items-center gap-[8px] border-b border-apsen-border pb-[12px] text-[13.5px] font-semibold text-apsen-slate">
      {children}
      {small === undefined ? null : (
        <small className="ml-auto text-[11px] font-normal text-apsen-muted">{small}</small>
      )}
    </div>
  );
}
