'use client';

import { ApsenLoader, ErrorState, PageHeader } from '@presentation/components/ui';
import { toUserMessage } from '../../format/errorMessage';
import { useDashboardOverview } from '../../hooks/dashboard/useDashboard';
import { useSessao } from '../../hooks/useSessao';
import { SemCicloAtivo } from '../ciclos/components/SemCicloAtivo';
import { BarrasPanel } from './components/BarrasPanel';
import { DashboardKpis } from './components/DashboardKpis';
import { PendentesPanel } from './components/PendentesPanel';
import { PerfilBanner } from './components/PerfilBanner';
import { PlanoStatusPanel } from './components/PlanoStatusPanel';
import { COR_CATEGORIA, COR_RESTRICAO } from './dashboardStyles';

const GRADE = 'grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1';

export function formatarAtualizadoEm(iso: string | undefined): string {
  return iso === undefined ? '—' : new Date(iso).toLocaleString('pt-BR');
}

export function DashboardScreen() {
  const { nivel } = useSessao();
  const query = useDashboardOverview();
  const dados = query.data;
  return (
    <>
      <PageHeader
        title="Dashboard — Demand Intelligence"
        description={
          dados === undefined || dados.ciclo !== null
            ? `Visão geral do ciclo ativo${dados === undefined ? '' : ` · ${dados.ciclo}`}`
            : 'Visão geral do ciclo ativo · Nenhum ciclo ativo'
        }
        actions={
          <span aria-live="polite" className="text-[12px] text-apsen-muted">
            Atualizado em <strong>{formatarAtualizadoEm(dados?.atualizadoEm)}</strong>
          </span>
        }
      />
      <PerfilBanner nivel={nivel} />
      {query.isPending ? <ApsenLoader variant="content" label="Carregando dashboard…" /> : null}
      {query.isError ? (
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : null}
      {dados === undefined || query.isError ? null : (
        <>
          {dados.ciclo === null ? (
            <SemCicloAtivo contexto="Os indicadores de plano, drivers e análises são do ciclo ativo." />
          ) : null}
          <DashboardKpis dados={dados} />
          <div className={`${GRADE} mb-[16px]`}>
            <BarrasPanel
              title="Drivers por Categoria"
              barras={dados.categorias}
              cores={COR_CATEGORIA}
              vazio="Nenhum driver registrado"
            />
            <BarrasPanel
              title="Restrições Ativas por Tipo"
              barras={dados.restricoesPorTipo}
              cores={COR_RESTRICAO}
              vazio="✅ Nenhuma restrição ativa"
            />
          </div>
          <div className={GRADE}>
            <PendentesPanel pendentes={dados.pendentes} />
            <PlanoStatusPanel plano={dados.plano} ciclo={dados.ciclo} />
          </div>
        </>
      )}
    </>
  );
}
