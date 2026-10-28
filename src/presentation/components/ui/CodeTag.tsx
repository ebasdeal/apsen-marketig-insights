import type { ReactNode } from 'react';

export type CodeTagTone =
  'slate' | 'muted' | 'blue' | 'red' | 'purple' | 'orange' | 'green' | 'teal' | 'yellow';

const TONES: Record<CodeTagTone, string> = {
  slate: 'text-apsen-slate',
  muted: 'text-apsen-muted',
  blue: 'text-apsen-blue',
  red: 'text-apsen-red',
  purple: 'text-apsen-purple',
  orange: 'text-apsen-orange',
  green: 'text-apsen-green',
  teal: 'text-apsen-teal',
  yellow: 'text-apsen-warning-fg',
};

interface CodeTagProps {
  children: ReactNode;
  tone?: CodeTagTone;
  className?: string;
}

export function CodeTag({ children, tone = 'slate', className = '' }: CodeTagProps) {
  return (
    <code
      className={`inline-block whitespace-nowrap rounded-[4px] bg-apsen-bg px-[7px] py-[2px] font-mono text-[11px] ${TONES[tone]} ${className}`.trim()}
    >
      {children}
    </code>
  );
}
