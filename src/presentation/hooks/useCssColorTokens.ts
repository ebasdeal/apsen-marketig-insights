'use client';

import { useMemo, useSyncExternalStore } from 'react';

const SEPARADOR = '|';

function assinar(aoMudar: () => void): () => void {
  const observer = new MutationObserver(aoMudar);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function lerValores(chave: string): string {
  const estilo = getComputedStyle(document.documentElement);
  return chave
    .split(SEPARADOR)
    .map((token) => estilo.getPropertyValue(token).trim())
    .join(SEPARADOR);
}

export function useCssColorTokens(tokens: readonly string[]): Record<string, string> {
  const chave = tokens.join(SEPARADOR);
  const valores = useSyncExternalStore(
    assinar,
    () => lerValores(chave),
    () => '',
  );
  return useMemo(() => {
    const lidos = valores.split(SEPARADOR);
    return Object.fromEntries(chave.split(SEPARADOR).map((token, i) => [token, lidos[i] ?? '']));
  }, [chave, valores]);
}
