'use client';

import {
  TESTE_DELAY_MS,
  TESTE_OK,
  testeConexao,
  type TesteConexao,
} from '@domain/fontes/fonteRules';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useTesteConexao() {
  const [resultado, setResultado] = useState<TesteConexao | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpar = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => limpar, [limpar]);

  const testar = useCallback(
    (url: string) => {
      limpar();
      const inicial = testeConexao(url);
      setResultado(inicial);
      if (inicial.tone === 'loading') {
        timer.current = setTimeout(() => {
          timer.current = null;
          setResultado(TESTE_OK);
        }, TESTE_DELAY_MS);
      }
    },
    [limpar],
  );

  return { resultado, testar };
}
