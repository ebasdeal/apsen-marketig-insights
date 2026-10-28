import type { ReactNode } from 'react';
import { stackedCellClass, stackedValueClass, type StackedCellKind } from './stackedTable';

interface StackedCellProps {
  label?: string | undefined;
  kind?: StackedCellKind;
  className?: string;
  children: ReactNode;
}

export function StackedCell({ label, kind = 'field', className = '', children }: StackedCellProps) {
  return (
    <td data-label={label} className={`${className} ${stackedCellClass(kind)}`.trim()}>
      <div className={stackedValueClass(kind)}>{children}</div>
    </td>
  );
}
