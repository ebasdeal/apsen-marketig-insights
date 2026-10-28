'use client';

import type { AnaliseDetailOutput } from '@application/analises/dto';
import { NotFoundError } from '@domain/shared/DomainError';
import { ApsenLoader, Breadcrumb, ErrorState, LoadingState } from '@presentation/components/ui';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAnalise } from '../../hooks/analises/useAnalises';
import {
  useExportarPdfMutation,
  useSalvarAnaliseMutation,
} from '../../hooks/analises/useAnalisesMutations';
import { ANALISES_ROUTE } from '../../navigation/routes';
import { useToast } from '../../providers/ToastProvider';
import { AnaliseHeader } from './components/AnaliseHeader';
import { AnaliseNaoEncontrada } from './components/AnaliseNaoEncontrada';
import { AnaliseResultado } from './components/AnaliseResultado';
import { mensagemFalhaAnalise } from './falhaEscrita';

const ChatPanel = dynamic(() => import('./components/ChatPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-[10px] border border-apsen-border bg-apsen-white">
      <ApsenLoader variant="inline" label="Carregando chat…" />
    </div>
  ),
});

const PdfExportModal = dynamic(() => import('./components/PdfExportModal'), { ssr: false });

export const TOAST_SALVA = '✅ Análise salva! PDF disponível.';

function AnaliseView({ analise }: { analise: AnaliseDetailOutput }) {
  const toast = useToast();
  const salvar = useSalvarAnaliseMutation();
  const exportar = useExportarPdfMutation();
  const [pdfAberto, setPdfAberto] = useState(false);

  const onSalvar = () =>
    salvar.mutate(analise.id, {
      onSuccess: () => toast.show(TOAST_SALVA),
      onError: (error) => toast.show(mensagemFalhaAnalise(error), { tone: 'error' }),
    });

  const onExportar = () =>
    exportar.mutate(analise.id, {
      onSuccess: () => setPdfAberto(true),
      onError: (error) => toast.show(mensagemFalhaAnalise(error), { tone: 'error' }),
    });

  return (
    <>
      <Breadcrumb
        items={[{ label: 'Análises', href: ANALISES_ROUTE }, { label: analise.titulo }]}
      />
      <AnaliseHeader
        analise={analise}
        salvando={salvar.isPending}
        exportando={exportar.isPending}
        onSalvar={onSalvar}
        onExportar={onExportar}
      />
      <div className="grid grid-cols-[1fr_360px] items-start gap-[16px] max-[1100px]:grid-cols-1">
        <AnaliseResultado analise={analise} />
        <aside aria-label="Chat · ApsenPLPEngine" className="sticky top-[16px] max-[1100px]:static">
          <p className="mb-[8px] text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted">
            Chat · ApsenPLPEngine
          </p>
          <ChatPanel
            analiseId={analise.id}
            ciclo={analise.ciclo}
            modelo={analise.modelo}
            iniciais={analise.mensagensChat}
          />
        </aside>
      </div>
      {pdfAberto ? <PdfExportModal open onClose={() => setPdfAberto(false)} /> : null}
    </>
  );
}

export function AnaliseViewScreen({ id }: { id: string }) {
  const query = useAnalise(id);
  if (query.isPending) return <LoadingState label="Carregando análise…" />;
  if (query.isError) {
    if (query.error instanceof NotFoundError) return <AnaliseNaoEncontrada />;
    return (
      <ErrorState
        message="Não foi possível carregar a análise."
        onRetry={() => void query.refetch()}
      />
    );
  }
  return <AnaliseView analise={query.data} />;
}
