import type { ReactNode } from 'react';
import { ActionGroup } from './IconButton';
import {
  columnLabel,
  STACK_BODY,
  STACK_HEAD,
  STACK_ROW,
  STACK_TABLE,
  STACK_WRAP,
  stackedCellClass,
  stackedValueClass,
  type StackedPriority,
} from './stackedTable';
import { Toolbar } from './Toolbar';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  className?: string;
  wrap?: boolean;
  mobile?: StackedPriority;
  label?: string;
}

interface TableProps<T> {
  caption: string;
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  emptyText: string;
  actions?: (row: T) => ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  rowClassName?: (row: T) => string;
}

const TH =
  'whitespace-nowrap px-[14px] py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em]';
const TD = 'border-b border-apsen-bg px-[14px] py-[12px] align-middle text-[13px]';
const NOWRAP = 'whitespace-nowrap';

function cellClass<T>(column: TableColumn<T>): string {
  return [
    TD,
    column.wrap === true ? '' : NOWRAP,
    column.className ?? '',
    stackedCellClass(column.mobile ?? 'field'),
  ]
    .filter(Boolean)
    .join(' ');
}

export function Table<T>({
  caption,
  columns,
  rows,
  rowKey,
  emptyText,
  actions,
  toolbar,
  footer,
  rowClassName,
}: TableProps<T>) {
  const total = columns.length + (actions === undefined ? 0 : 1);
  return (
    <>
      {toolbar === undefined ? null : <Toolbar>{toolbar}</Toolbar>}
      <div
        className={`overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm ${STACK_WRAP}`}
      >
        <table className={`w-full min-w-[560px] border-collapse ${STACK_TABLE}`}>
          <caption className="sr-only">{caption}</caption>
          <thead className={STACK_HEAD}>
            <tr className="border-b border-apsen-border bg-apsen-bg">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${TH} ${column.headerClassName ?? 'text-apsen-muted'}`}
                >
                  {column.header}
                </th>
              ))}
              {actions === undefined ? null : (
                <th scope="col" className={`${TH} text-apsen-muted`}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className={STACK_BODY}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={total} className="p-[30px] text-center text-[13px] text-apsen-muted">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`hover:bg-apsen-row-hover [&:last-child>td]:border-b-0 ${STACK_ROW} ${rowClassName?.(row) ?? ''}`.trim()}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-label={columnLabel(column.header, column.label)}
                      className={cellClass(column)}
                    >
                      <div className={stackedValueClass(column.mobile ?? 'field')}>
                        {column.render(row)}
                      </div>
                    </td>
                  ))}
                  {actions === undefined ? null : (
                    <td className={`${TD} ${NOWRAP} ${stackedCellClass('actions')}`}>
                      <ActionGroup>{actions(row)}</ActionGroup>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </>
  );
}
