'use client';

import type { AutocompleteItem } from '@presentation/components/ui';
import { useCallback, useRef } from 'react';

export function usePickerSearch<T>(
  buscar: (termo: string) => Promise<readonly T[]>,
  toItem: (value: T) => AutocompleteItem,
) {
  const vistos = useRef(new Map<string, T>());
  const search = useCallback(
    async (termo: string) => {
      const lista = await buscar(termo);
      const itens = lista.map((value) => {
        const item = toItem(value);
        vistos.current.set(item.value, value);
        return item;
      });
      return itens;
    },
    [buscar, toItem],
  );
  const resolve = useCallback((texto: string) => vistos.current.get(texto), []);
  return { search, resolve };
}
