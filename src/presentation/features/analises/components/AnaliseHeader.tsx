'use client';

import type { AnaliseDetailOutput } from '@application/analises/dto';
import { Button } from '@presentation/components/ui';
import type { ReactNode } from 'react';
import { AnaliseStatusPill } from './AnaliseStatusPill';

interface AnaliseHeaderProps {
  analise: AnaliseDetailOutput;
  salvando: boolean;
  exportando: boolean;
  onSalvar: () => void;
  onExportar: () => void;
}

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {children}
    </svg>
  );
}

export function AnaliseHeader({
  analise,
  salvando,
  exportando,
  onSalvar,
  onExportar,
}: AnaliseHeaderProps) {
  return (
    <header className="mb-[16px] flex flex-wrap items-center justify-between gap-[10px]">
      <div>
        <h1 className="page-title">{analise.titulo}</h1>
        <p className="page-sub">
          Ciclo: <strong>{analise.ciclo}</strong> · Modelo: <strong>{analise.modelo}</strong> ·{' '}
          {analise.metaSkus} · {analise.criada}
        </p>
      </div>
      <div className="flex items-center gap-[8px]">
        <AnaliseStatusPill status={analise.status} size="lg" />
        <Button escrita variant="ghost" size="sm" loading={salvando} onClick={onSalvar}>
          <Icone>
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
          </Icone>
          Salvar
        </Button>
        <Button
          escrita
          variant="ghost"
          size="sm"
          disabled={!analise.podeExportarPdf || exportando}
          title={analise.podeExportarPdf ? undefined : 'Salve antes de emitir o relatório.'}
          className="disabled:opacity-40!"
          onClick={onExportar}
        >
          <Icone>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </Icone>
          Exportar PDF
        </Button>
      </div>
    </header>
  );
}
