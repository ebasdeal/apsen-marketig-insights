export type StackedPriority = 'title' | 'field' | 'hidden';

export const STACK_WRAP =
  'max-md:overflow-visible max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none';
export const STACK_TABLE = 'max-md:block max-md:min-w-0';
export const STACK_HEAD = 'max-md:sr-only';
export const STACK_BODY = 'max-md:block';
export const STACK_ROW =
  'max-md:mb-[10px] max-md:block max-md:rounded-apsen-lg max-md:border max-md:border-apsen-border max-md:bg-apsen-white max-md:p-[12px] max-md:shadow-apsen-sm';

const STACK_CELL_BASE = 'max-md:whitespace-normal max-md:border-b-0 max-md:px-0 max-md:text-left';

const STACK_FIELD =
  'max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-[12px] max-md:py-[5px] max-md:before:shrink-0 max-md:before:text-[11px] max-md:before:font-semibold max-md:before:text-apsen-muted max-md:before:content-[attr(data-label)]';

const STACK_TITLE =
  'max-md:block max-md:pt-0 max-md:pb-[6px] max-md:text-[14px] max-md:font-semibold';

const STACK_ACTIONS =
  'max-md:mt-[6px] max-md:block max-md:border-t max-md:border-apsen-bg max-md:pt-[8px] max-md:pb-0';

const STACK_ACTIONS_CELL = `${STACK_CELL_BASE} ${STACK_ACTIONS}`;

export const STACK_VALUE = 'max-md:min-w-0 max-md:text-right max-md:[overflow-wrap:anywhere]';
export const STACK_TITLE_VALUE = 'max-md:text-left';

export type StackedCellKind = StackedPriority | 'actions' | 'form';

const STACK_FORM =
  'max-md:flex max-md:flex-col max-md:gap-[4px] max-md:py-[5px] max-md:before:text-[11px] max-md:before:font-semibold max-md:before:text-apsen-muted max-md:before:content-[attr(data-label)]';

export function stackedCellClass(priority: StackedCellKind): string {
  if (priority === 'actions') return STACK_ACTIONS_CELL;
  if (priority === 'form') return `${STACK_CELL_BASE} ${STACK_FORM}`;
  if (priority === 'hidden') return 'max-md:hidden';
  if (priority === 'title') return `${STACK_CELL_BASE} ${STACK_TITLE}`;
  return `${STACK_CELL_BASE} ${STACK_FIELD}`;
}

export function stackedValueClass(priority: StackedCellKind): string {
  if (priority === 'actions') return '';
  if (priority === 'form') return 'max-md:w-full max-md:min-w-0';
  return priority === 'title' ? STACK_TITLE_VALUE : STACK_VALUE;
}

export function columnLabel(header: unknown, label: string | undefined): string | undefined {
  if (label !== undefined) return label;
  return typeof header === 'string' ? header : undefined;
}
