'use client';

import type { NovaAnaliseForm } from '@domain/analises/Analise';
import { AnaliseInvalidaError } from '@domain/analises/AnaliseInvalidaError';
import { validarNovaAnalise } from '@domain/analises/analiseRules';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExecutarAnaliseMutation } from '../../hooks/analises/useAnalisesMutations';
import { analiseRoute } from '../../navigation/routes';
import { useToast } from '../../providers/ToastProvider';
import { mensagemFalhaAnalise } from './falhaEscrita';
import { erroDoCampo, type ErrosNovaAnalise } from './novaAnaliseForm';

export const TOAST_EXECUTANDO = '⟳ Executando análise com o ApsenPLPEngine...';
export const TOAST_EXECUTADA = '✅ Análise executada! Salve para emitir o relatório.';

export function useExecutarNovaAnalise(onInvalido: (erros: ErrosNovaAnalise) => void) {
  const router = useRouter();
  const toast = useToast();
  const mutation = useExecutarAnaliseMutation();
  const [concluida, setConcluida] = useState(false);

  function invalidar(error: AnaliseInvalidaError) {
    toast.show(error.message, { tone: 'warning' });
    onInvalido(error.campo === undefined ? {} : { [error.campo]: erroDoCampo(error.message) });
  }

  async function executar(form: NovaAnaliseForm) {
    try {
      validarNovaAnalise(form);
    } catch (error) {
      if (error instanceof AnaliseInvalidaError) {
        invalidar(error);
        return;
      }
      throw error;
    }
    onInvalido({});
    toast.show(TOAST_EXECUTANDO, { tone: 'info' });
    try {
      const { id } = await mutation.mutateAsync(form);
      setConcluida(true);
      router.push(analiseRoute(id));
      toast.show(TOAST_EXECUTADA, { tone: 'success' });
    } catch (error) {
      if (error instanceof AnaliseInvalidaError) {
        invalidar(error);
        return;
      }
      toast.show(mensagemFalhaAnalise(error), { tone: 'error' });
    }
  }

  return { executar, executando: mutation.isPending, concluida };
}
