'use client';

import { useRef, type KeyboardEvent } from 'react';
import { nextTabIndex } from './tabKeys';

export interface ModeOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

type ModeSize = 'lg' | 'md' | 'sm';

interface ModeSelectorProps<T extends string> {
  'aria-label': string;
  options: readonly ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accent?: 'blue' | 'orange';
  size?: ModeSize;
  disabled?: boolean;
}

const OPTION =
  'flex flex-1 cursor-pointer flex-col items-center gap-[3px] rounded-apsen border-2 font-[inherit] transition-all duration-[150ms] focus-ring disabled:cursor-default';
const INACTIVE = 'border-apsen-border bg-apsen-white text-apsen-muted';
const ACTIVE = {
  blue: 'border-apsen-blue bg-apsen-blue text-white',
  orange: 'border-apsen-orange bg-apsen-orange text-white',
};
const SIZES: Record<ModeSize, { option: string; label: string; description: string }> = {
  lg: {
    option: 'px-[16px] py-[12px] text-[13px] font-semibold',
    label: '',
    description: 'text-[11px] font-normal opacity-[.85]',
  },
  md: {
    option: 'px-[8px] py-[11px]',
    label: 'text-[12px] font-semibold',
    description: 'text-[10px] opacity-[.85]',
  },
  sm: { option: 'p-[10px] text-[12.5px] font-semibold', label: '', description: '' },
};

export function ModeSelector<T extends string>({
  'aria-label': label,
  options,
  value,
  onChange,
  accent = 'blue',
  size = 'lg',
  disabled = false,
}: ModeSelectorProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const sizing = SIZES[size];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = nextTabIndex(current, options.length, event.key);
    const option = next === null ? undefined : options[next];
    if (next === null || option === undefined) return;
    event.preventDefault();
    onChange(option.value);
    buttons.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-[8px]">
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={index === current ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
            className={`${OPTION} ${sizing.option} ${active ? ACTIVE[accent] : INACTIVE}`}
          >
            {size === 'sm' ? (
              <span>
                {option.icon === undefined ? null : (
                  <span aria-hidden="true">{`${option.icon} `}</span>
                )}
                {option.label}
              </span>
            ) : (
              <>
                {option.icon === undefined ? null : (
                  <span aria-hidden="true" className="text-[18px]">
                    {option.icon}
                  </span>
                )}
                <span className={sizing.label}>{option.label}</span>
                {option.description === undefined ? null : (
                  <span className={sizing.description}>{option.description}</span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
