import { StackedCell } from '@presentation/components/ui/StackedCell';
import {
  columnLabel,
  STACK_BODY,
  STACK_HEAD,
  STACK_ROW,
  STACK_TABLE,
  STACK_WRAP,
  type StackedPriority,
} from '@presentation/components/ui/stackedTable';
import type { ReactNode } from 'react';

export interface CardTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  center?: boolean;
  className?: string;
  wrap?: boolean;
  mobile?: StackedPriority;
  label?: string;
}

interface CardTableProps<T> {
  caption: string;
  columns: readonly CardTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  emptyText: string;
}

const TH =
  'whitespace-nowrap border-b border-apsen-border px-[16px] py-[11px] text-[11px] font-semibold uppercase tracking-[.05em] text-apsen-muted';
const TD = 'border-b border-apsen-bg px-[16px] py-[11px] align-middle text-[13px]';

export function CardTable<T>({ caption, columns, rows, rowKey, emptyText }: CardTableProps<T>) {
  const align = (column: CardTableColumn<T>) =>
    column.center === true ? 'text-center' : 'text-left';
  return (
    <div
      className={`mb-[16px] relative overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm ${STACK_WRAP}`}
    >
      <table className={`w-full min-w-[640px] border-collapse ${STACK_TABLE}`}>
        <caption className="sr-only">{caption}</caption>
        <thead className={STACK_HEAD}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`${TH} ${align(column)}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={STACK_BODY}>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-[30px] text-center text-[13px] text-apsen-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={`hover:bg-apsen-row-hover [&:last-child>td]:border-b-0 ${STACK_ROW}`}
              >
                {columns.map((column) => (
                  <StackedCell
                    key={column.key}
                    label={columnLabel(column.header, column.label)}
                    kind={column.mobile ?? 'field'}
                    className={`${TD} ${column.wrap === true ? '' : 'whitespace-nowrap'} ${align(column)} ${column.className ?? ''}`
                      .replace(/s+/g, ' ')
                      .trim()}
                  >
                    {column.render(row)}
                  </StackedCell>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
