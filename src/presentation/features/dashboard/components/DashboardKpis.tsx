import type { DashboardOverviewOutput } from '@application/dashboard/dto';
import { podeAcessar } from '@domain/perfis/acesso';
import type { NivelAcesso } from '@domain/perfis/Perfil';
import { KpiCard } from '@presentation/components/ui';
import type { Route } from 'next';
import { formatInteger } from '../../../format/formatters';
import { ANALISES_ROUTE } from '../../../navigation/routes';
import { matchScreen } from '../../../navigation/screens';

// Só linka para rotas que o perfil consegue abrir (PRG-DSH-04); sem acesso o cartão fica informativo.
function rotaDoPerfil(rota: string, nivel: NivelAcesso | undefined): Route | undefined {
  const minimo = matchScreen(rota)?.nivelMinimo ?? null;
  return nivel !== undefined && podeAcessar(nivel, minimo) ? (rota as Route) : undefined;
}

interface DashboardKpisProps {
  dados: DashboardOverviewOutput;
  nivel: NivelAcesso | undefined;
}

export function DashboardKpis({ dados, nivel }: DashboardKpisProps) {
  return (
    <div className="kpi-grid">
      <KpiCard
        icon="📥"
        tone="blue"
        hintTone="yellow"
        value={formatInteger(dados.pipeline.total)}
        label="Drivers no pipeline"
        hint={`${dados.pipeline.pendentes} pendentes`}
        href={rotaDoPerfil('/admin/aprovacoes', nivel)}
      />
      <KpiCard
        icon="⚠️"
        tone="red"
        value={formatInteger(dados.restricoes.ativas)}
        label="Restrições ativas"
        hint={`${dados.restricoes.criticas} críticas`}
        href={rotaDoPerfil('/restricoes', nivel)}
      />
      <KpiCard
        icon="📋"
        tone="green"
        value={formatInteger(dados.plano.total)}
        label={
          dados.ciclo === null
            ? 'Itens no plano (sem ciclo ativo)'
            : `Itens no plano ${dados.ciclo}`
        }
        hint={`${dados.plano.aprovados} aprovados`}
        href={rotaDoPerfil('/planos', nivel)}
      />
      <KpiCard
        icon="🔬"
        tone="orange"
        hintTone="green"
        value={formatInteger(dados.analises.total)}
        label="Análises realizadas"
        hint={`${dados.analises.salvas} salvas`}
        href={rotaDoPerfil(ANALISES_ROUTE, nivel)}
      />
    </div>
  );
}
