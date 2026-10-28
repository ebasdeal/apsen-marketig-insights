import type { ReactNode } from 'react';

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  page?: boolean;
}

const BASE =
  'sticky bottom-0 z-10 flex flex-wrap justify-end gap-[8px] border-t border-apsen-border';
const CARD = 'bg-apsen-white pt-[14px] pb-[8px]';
const PAGE = '-mx-[24px] -mb-[22px] bg-apsen-bg px-[24px] py-[12px]';

export function FormActions({ children, className = '', page = false }: FormActionsProps) {
  return <div className={`${BASE} ${page ? PAGE : CARD} ${className}`.trim()}>{children}</div>;
}
