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
  step?: string;
  stepTone?: 'blue' | 'orange';
}

const STEP_TONES = {
  blue: 'bg-apsen-blue-bg text-apsen-blue',
  orange: 'bg-apsen-orange-soft text-apsen-orange',
};

export function CardTitle({ children, small, step, stepTone = 'blue' }: CardTitleProps) {
  return (
    <div className="mb-[16px] flex items-center gap-[8px] border-b border-apsen-border pb-[12px] text-[13.5px] font-semibold text-apsen-slate">
      {step === undefined ? null : (
        <span
          className={`shrink-0 whitespace-nowrap rounded-[6px] px-[10px] py-[2px] text-[11px] font-bold ${STEP_TONES[stepTone]}`}
        >
          {step}
        </span>
      )}
      {children}
      {small === undefined ? null : (
        <small className="ml-auto text-[11px] font-normal text-apsen-muted">{small}</small>
      )}
    </div>
  );
}
