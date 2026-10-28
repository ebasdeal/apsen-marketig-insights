'use client';

import { pageCountOf } from '@domain/shared/Page';
import {
  ButtonLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { useEffect, useRef, useState } from 'react';
import { useAnalises } from '../../hooks/analises/useAnalises';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { NOVA_ANALISE_ROUTE } from '../../navigation/routes';
import { useUrlState } from '../../navigation/useUrlState';
import { ANALISES_URL_SPEC, rotuloContagem, statusDoFiltro } from './analisesUrl';
import { AnalisesFiltros } from './components/AnalisesFiltros';
import { AnalysisCard } from './components/AnalysisCard';

function AnalisesDescricao() {
  return (
    <ScreenDesc icon="🔬">
      <strong>Análises de impacto de drivers em SKUs específicos, com suporte de IA.</strong> Cada
      análise vincula ciclo, SKUs e drivers aprovados, aplica modelo estatístico e documenta
      justificativas. O chat permite refinamentos diretos.{' '}
      <em>Salvar é obrigatório para emitir relatório.</em>
    </ScreenDesc>
  );
}

export function AnalisesScreen() {
  const [url, setUrl] = useUrlState(ANALISES_URL_SPEC);
  const status = statusDoFiltro(url.status);
  const [busca, setBusca] = useState(url.busca);
  const buscaAplicada = useDebouncedValue(busca);
  const ultimaAplicada = useRef(buscaAplicada);

  useEffect(() => {
    if (buscaAplicada === ultimaAplicada.current) return;
    ultimaAplicada.current = buscaAplicada;
    setUrl({ busca: buscaAplicada, pagina: 1 });
  }, [buscaAplicada, setUrl]);

  const query = useAnalises({ busca: url.busca, status, pagina: url.pagina });
  const dados = query.data;

  return (
    <>
      <PageHeader
        title="Análises"
        description="Análises de impacto de drivers · ApsenPLPEngine"
        actions={
          <ButtonLink href={NOVA_ANALISE_ROUTE} variant="orange" size="sm">
            + Nova Análise
          </ButtonLink>
        }
      />
      <AnalisesDescricao />
      <AnalisesFiltros
        busca={busca}
        status={status}
        onBusca={setBusca}
        onStatus={(valor) => setUrl({ status: valor, pagina: 1 })}
      />
      {query.isPending ? <LoadingState label="Carregando análises…" /> : null}
      {query.isError ? (
        <ErrorState
          message="Não foi possível carregar as análises."
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {dados === undefined || query.isError ? null : (
        <>
          <p aria-live="polite" className="mb-[12px] text-[13px] text-apsen-muted">
            <strong>{dados.total}</strong> {rotuloContagem(dados.total)}
          </p>
          {dados.itens.length === 0 ? (
            <EmptyState icon="🔬" title="Nenhuma análise encontrada" />
          ) : (
            <ul>
              {dados.itens.map((analise) => (
                <AnalysisCard key={analise.id} analise={analise} />
              ))}
            </ul>
          )}
          {dados.total > dados.tamanho ? (
            <Pagination
              page={dados.pagina}
              totalPages={pageCountOf(dados.total, dados.tamanho)}
              onPageChange={(pagina) => setUrl({ pagina })}
            />
          ) : null}
        </>
      )}
    </>
  );
}
