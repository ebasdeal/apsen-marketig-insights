import { stackedCellClass, type StackedPriority } from './stackedTable';

interface CellShape {
  wrap?: boolean | undefined;
  className?: string | undefined;
  mobile?: StackedPriority | undefined;
}

const TH_BASE = 'py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em]';
const TD_BASE = 'border-b border-apsen-bg py-[12px] align-middle text-[13px]';
const NOWRAP = 'whitespace-nowrap';

export function headCellClass(compact: boolean): string {
  return compact ? `${TH_BASE} px-[7px]` : `${NOWRAP} ${TH_BASE} px-[14px]`;
}

export function bodyCellBase(compact: boolean): string {
  return `${TD_BASE} ${compact ? 'px-[7px]' : 'px-[14px]'}`;
}

export function bodyCellClass(column: CellShape, compact: boolean): string {
  return [
    bodyCellBase(compact),
    column.wrap === true ? '' : NOWRAP,
    column.className ?? '',
    stackedCellClass(column.mobile ?? 'field'),
  ]
    .filter(Boolean)
    .join(' ');
}

export function actionCellClass(compact: boolean): string {
  return `${bodyCellBase(compact)} ${NOWRAP} ${stackedCellClass('actions')}`;
}
