'use client';

export interface ChipOption<T> {
  value: T;
  label: string;
}

interface ChipGroupProps<T> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  hideLabel?: boolean;
}

const LABEL = 'text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted';
const BASE_CHIP =
  'inline-flex cursor-pointer select-none items-center rounded-[14px] border px-[10px] py-[3px] text-[12px] transition-all duration-[130ms] focus-ring';
const ACTIVE_CHIP = 'border-apsen-blue bg-apsen-blue-bg font-semibold text-apsen-blue';
const INACTIVE_CHIP =
  'border-apsen-border bg-apsen-bg text-apsen-muted hover:border-apsen-blue hover:text-apsen-blue';

export function ChipGroup<T>({
  label,
  options,
  selected,
  onSelect,
  hideLabel = false,
}: ChipGroupProps<T>) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span aria-hidden="true" className={hideLabel ? 'sr-only' : LABEL}>
        {label}
      </span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-[5px]">
        {options.map((option) => {
          const active = Object.is(option.value, selected);
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label}: ${option.label}`}
              onClick={() => onSelect(option.value)}
              className={`${BASE_CHIP} ${active ? ACTIVE_CHIP : INACTIVE_CHIP}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
