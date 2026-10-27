'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { nextTabIndex } from './tabKeys';

export type TabsTone = 'blue' | 'red';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  id: string;
  'aria-label': string;
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
  tone?: TabsTone;
}

const TAB =
  '-mb-px cursor-pointer whitespace-nowrap border-0 border-b-2 bg-transparent px-[20px] py-[9px] text-[13px] transition-all focus-ring';
const ACTIVE: Record<TabsTone, string> = {
  blue: 'border-apsen-blue font-medium text-apsen-blue',
  red: 'border-apsen-red font-medium text-apsen-red',
};
const COUNT = 'ml-[4px] rounded-[10px] px-[7px] py-[1px] text-[10px]';
const COUNT_ACTIVE: Record<TabsTone, string> = {
  blue: 'bg-apsen-blue font-bold text-white',
  red: 'bg-apsen-red font-bold text-white',
};

export function Tabs<T extends string>({
  id,
  'aria-label': label,
  items,
  value,
  onChange,
  children,
  tone = 'blue',
}: TabsProps<T>) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = nextTabIndex(current, items.length, event.key);
    const item = next === null ? undefined : items[next];
    if (next === null || item === undefined) {
      return;
    }
    event.preventDefault();
    onChange(item.value);
    tabs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="mb-[16px] flex border-b border-apsen-border"
      >
        {items.map((item, index) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${item.value}`}
              aria-label={item.count === undefined ? item.label : `${item.label} ${item.count}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.value)}
              onKeyDown={onKeyDown}
              className={`${TAB} ${selected ? ACTIVE[tone] : 'border-transparent text-apsen-muted'}`}
            >
              {item.label}
              {item.count === undefined ? null : (
                <span
                  className={`${COUNT} ${selected ? COUNT_ACTIVE[tone] : 'bg-apsen-border font-semibold text-apsen-muted'}`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${value}`}
        tabIndex={0}
        className="focus-ring"
      >
        {children}
      </div>
    </div>
  );
}
