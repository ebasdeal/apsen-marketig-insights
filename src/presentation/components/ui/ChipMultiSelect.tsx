'use client';

import type { ReactNode } from 'react';
import type { ChipOption } from './ChipGroup';
import {
  CHIP_ACTIVE,
  CHIP_BASE,
  CHIP_INACTIVE,
  CHIP_INACTIVE_STATIC,
  CHIP_LABEL,
} from './chipClasses';

interface ChipMultiSelectProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onChange: (next: T[]) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tip?: ReactNode;
}

export function toggleChip<T extends string>(
  options: readonly ChipOption<T>[],
  selected: readonly T[],
  value: T,
): T[] {
  const chosen = new Set(selected);
  if (chosen.has(value)) chosen.delete(value);
  else chosen.add(value);
  return options.map((option) => option.value).filter((item) => chosen.has(item));
}

export function ChipMultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  disabled = false,
  hideLabel = false,
  tip,
}: ChipMultiSelectProps<T>) {
  const inactive = disabled ? CHIP_INACTIVE_STATIC : CHIP_INACTIVE;
  return (
    <div className="flex flex-col gap-[5px]">
      <div className={hideLabel ? 'sr-only' : 'flex items-center'}>
        <span aria-hidden="true" className={CHIP_LABEL}>
          {label}
        </span>
        {tip}
      </div>
      <div role="group" aria-label={label} className="mt-[4px] flex flex-wrap gap-[5px]">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(toggleChip(options, selected, option.value))}
              className={`${CHIP_BASE} disabled:cursor-default ${active ? CHIP_ACTIVE : inactive}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
