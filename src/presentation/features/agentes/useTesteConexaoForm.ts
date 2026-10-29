'use client';

import {
  AGENTE_TESTAR_FORM_INICIO_TOAST,
  AGENTE_TESTAR_FORM_OK_TOAST,
} from '@application/agentes/dto';
import { useEffect, useRef } from 'react';
import { useToast } from '../../providers/ToastProvider';

export const TESTE_FORM_MS = 2000;

export function useTesteConexaoForm() {
  const { show } = useToast();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  return () => {
    show(AGENTE_TESTAR_FORM_INICIO_TOAST);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => show(AGENTE_TESTAR_FORM_OK_TOAST), TESTE_FORM_MS);
  };
}
