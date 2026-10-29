'use client';

import type { AnaliseDetailOutput } from '@application/analises/dto';
import { ApsenLoader, NumberedList, Section } from '@presentation/components/ui';
import dynamic from 'next/dynamic';
import { ComparacaoResumo } from './ComparacaoResumo';
import { ComparacaoTable } from './ComparacaoTable';
import { ImpactRow } from './ImpactRow';
import { InteracoesDocumentadas } from './InteracoesDocumentadas';
import { RichText } from './RichText';

const ComparacaoChart = dynamic(() => import('../chart/ComparacaoChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[250px] items-center justify-center">
      <ApsenLoader variant="inline" label="Carregando gráfico…" />
    </div>
  ),
});

export function AnaliseResultado({ analise }: { analise: AnaliseDetailOutput }) {
  return (
    <div className="min-w-0">
      <Section variant="detail" title="📄 Sumário Executivo">
        <RichText segmentos={analise.sumarioSegmentos} />
      </Section>
      <Section variant="detail" title="📊 Impacto por Driver">
        <ul>
          {analise.impactos.map((impacto) => (
            <ImpactRow key={impacto.id} impacto={impacto} />
          ))}
        </ul>
      </Section>
      <Section variant="detail" title="📈 Previsão: com vs. sem drivers">
        <ComparacaoResumo comparacao={analise.comparacao} />
        <div className="relative mb-[18px] h-[250px]">
          <ComparacaoChart comparacao={analise.comparacao} />
        </div>
        <p className="mb-[10px] text-[11.5px] text-apsen-muted">
          Linhas pontilhadas: intervalo de {analise.comparacao.incerteza.nivel}% da previsão com
          drivers. A incerteza cresce com o horizonte.
        </p>
        <ComparacaoTable comparacao={analise.comparacao} />
      </Section>
      <Section variant="detail" title="📋 Justificativas">
        <NumberedList items={analise.justificativas} aria-label="Justificativas" />
      </Section>
      <Section variant="detail" title="⚙️ Modelo Utilizado">
        <p className="text-[13px] leading-[1.7]">
          {analise.modeloInfo === '' ? '—' : analise.modeloInfo}
        </p>
      </Section>
      {analise.historico.length === 0 ? null : (
        <Section variant="detail" title="💬 Interações com IA Documentadas">
          <InteracoesDocumentadas historico={analise.historico} />
        </Section>
      )}
    </div>
  );
}
