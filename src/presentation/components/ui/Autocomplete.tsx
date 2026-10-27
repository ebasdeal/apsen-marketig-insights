'use client';

import { DEFAULT_DEBOUNCE_MS } from '@presentation/hooks/useDebouncedValue';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { AutocompleteMenu, optionId } from './AutocompleteMenu';
import { TextInput } from './TextInput';
import { useAutocomplete, type AutocompleteItem } from './useAutocomplete';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  search: (term: string) => Promise<readonly AutocompleteItem[]>;
  sourceLabel: string;
  'aria-label'?: string;
  placeholder?: string;
  itemTag?: string;
  loadingText?: string;
  disabledMessage?: string;
  debounceMs?: number;
  allowFreeText?: boolean;
}

export function Autocomplete({
  value,
  onChange,
  search,
  sourceLabel,
  'aria-label': label,
  placeholder,
  itemTag,
  loadingText = 'Consultando...',
  disabledMessage,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  allowFreeText = true,
}: AutocompleteProps) {
  const listId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const state = useAutocomplete({ search, debounceMs, disabledMessage });
  const { open, items, activeIndex, close } = state;

  function dismiss() {
    if (!allowFreeText && !items.some((item) => item.value === value)) onChange('');
    close();
  }

  const dismissRef = useRef(dismiss);
  useEffect(() => {
    dismissRef.current = dismiss;
  });

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || wrapper.current?.contains(event.target) !== true) {
        dismissRef.current();
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  function pick(next: string) {
    onChange(next);
    close();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const active = items[activeIndex];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) state.trigger(value);
      else state.move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && open && active !== undefined) {
      event.preventDefault();
      pick(active.value);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      dismiss();
    }
  }

  return (
    <div ref={wrapper} className="relative">
      <TextInput
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? optionId(listId, activeIndex) : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onFocus={() => state.trigger(value)}
        onKeyDown={onKeyDown}
        onChange={(next) => {
          onChange(next);
          state.trigger(next);
        }}
      />
      {open ? (
        <AutocompleteMenu
          listId={listId}
          label={label}
          items={items}
          status={state.status}
          activeIndex={activeIndex}
          itemTag={itemTag}
          loadingText={loadingText}
          disabledMessage={disabledMessage}
          sourceLabel={sourceLabel}
          onPick={pick}
        />
      ) : null}
    </div>
  );
}
