'use client';

import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';
import { useEffect, useRef, useState } from 'react';

export interface AutocompleteItem {
  value: string;
  tag?: string;
}

export type AutocompleteStatus = 'idle' | 'loading' | 'ready' | 'blocked';

interface UseAutocompleteOptions {
  search: (term: string) => Promise<readonly AutocompleteItem[]>;
  debounceMs: number;
  disabledMessage: string | undefined;
}

interface Query {
  term: string;
  seq: number;
}

export function useAutocomplete({ search, debounceMs, disabledMessage }: UseAutocompleteOptions) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<readonly AutocompleteItem[]>([]);
  const [status, setStatus] = useState<AutocompleteStatus>('idle');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState<Query>({ term: '', seq: 0 });
  const debounced = useDebouncedValue(query, debounceMs);
  const request = useRef(0);
  const searchRef = useRef(search);
  const blocked = disabledMessage !== undefined;

  useEffect(() => {
    searchRef.current = search;
  });

  useEffect(() => {
    if (debounced.seq === 0 || blocked) return;
    const id = request.current;
    const settle = (result: readonly AutocompleteItem[]) => {
      if (id !== request.current) return;
      setItems(result);
      setStatus('ready');
    };
    searchRef.current(debounced.term).then(settle, () => settle([]));
  }, [debounced, blocked]);

  function trigger(term: string) {
    request.current += 1;
    setOpen(true);
    setActiveIndex(-1);
    if (blocked) {
      setStatus('blocked');
      return;
    }
    setStatus('loading');
    setQuery((previous) => ({ term: term.trim(), seq: previous.seq + 1 }));
  }

  function close() {
    request.current += 1;
    setOpen(false);
    setActiveIndex(-1);
  }

  function move(step: number) {
    if (items.length === 0 || status !== 'ready') return;
    setActiveIndex((current) => {
      if (current < 0) return step > 0 ? 0 : items.length - 1;
      return (current + step + items.length) % items.length;
    });
  }

  return { open, items, status, activeIndex, trigger, close, move };
}
