import { useId, type ReactNode } from 'react';

export type SectionVariant = 'panel' | 'detail';

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  variant?: SectionVariant;
}

const CONTAINER: Record<SectionVariant, string> = {
  panel: 'surface px-[18px] py-[16px]',
  detail: 'mb-[12px] rounded-[10px] border border-apsen-border bg-apsen-white px-[18px] py-[16px]',
};

const TITLE: Record<SectionVariant, string> = {
  panel: 'text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted',
  detail:
    'mb-[10px] border-b-2 border-apsen-orange-soft pb-[8px] text-[11px] font-bold uppercase tracking-[.07em] text-apsen-orange',
};

export function Section({ title, action, children, variant = 'panel' }: SectionProps) {
  const headingId = useId();
  const heading = (
    <h2
      id={headingId}
      className={`${TITLE[variant]} ${action === undefined && variant === 'panel' ? 'mb-[12px]' : ''}`.trim()}
    >
      {title}
    </h2>
  );
  return (
    <section aria-labelledby={headingId} className={CONTAINER[variant]}>
      {action === undefined ? (
        heading
      ) : (
        <div className="mb-[12px] flex items-center justify-between">
          {heading}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
