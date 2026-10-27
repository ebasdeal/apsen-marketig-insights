'use client';

import { CHIP_ACTIVE, CHIP_BASE, CHIP_INACTIVE, CHIP_LABEL } from './chipClasses';

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

export function ChipGroup<T>({
  label,
  options,
  selected,
  onSelect,
  hideLabel = false,
}: ChipGroupProps<T>) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span aria-hidden="true" className={hideLabel ? 'sr-only' : CHIP_LABEL}>
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
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
