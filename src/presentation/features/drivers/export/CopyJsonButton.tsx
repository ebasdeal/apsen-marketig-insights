'use client';

import { Button } from '@presentation/components/ui';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useState } from 'react';

export const COPIADO_MS = 1600;

export const FALHA_COPIAR = '⚠️ Não foi possível copiar o JSON.';

interface CopyJsonButtonProps {
  gerar: () => Promise<string>;
}

export function CopyJsonButton({ gerar }: CopyJsonButtonProps) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) {
      return undefined;
    }
    const timer = setTimeout(() => setCopiado(false), COPIADO_MS);
    return () => clearTimeout(timer);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(await gerar());
      setCopiado(true);
    } catch {
      toast.show(FALHA_COPIAR);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void copiar()}>
      <span aria-live="polite">{copiado ? '✅ Copiado!' : '📋 Copiar JSON'}</span>
    </Button>
  );
}
