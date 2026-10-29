import type { PlanoStatusDashboard } from '@domain/dashboard/DashboardOverview';
import type { NivelAcesso } from '@domain/perfis/Perfil';

export const COR_CATEGORIA: Record<string, string> = {
  midia: 'bg-apsen-ch-google',
  comercial: 'bg-apsen-ch-email',
  supply: 'bg-apsen-ch-extra',
  regulatorio: 'bg-apsen-ch-linkedin',
  sazo: 'bg-apsen-ch-tiktok',
  concorrencia: 'bg-apsen-ch-meta',
};

export const COR_RESTRICAO: Record<string, string> = {
  mp: 'bg-apsen-ch-extra',
  capacidade: 'bg-apsen-ch-email',
  demanda: 'bg-apsen-ch-google',
  qualidade: 'bg-apsen-ch-linkedin',
  regulatorio: 'bg-apsen-ch-meta',
  logistica: 'bg-apsen-ch-tiktok',
};

export const TOM_STATUS_PLANO: Record<PlanoStatusDashboard, 'green' | 'orange' | 'red' | 'muted'> =
  {
    aprovado: 'green',
    revisao: 'orange',
    bloqueado: 'red',
    pendente: 'muted',
  };

export interface BannerPerfil {
  perfil: string;
  texto: string;
  classes: string;
}

export const BANNER_PERFIL: Partial<Record<NivelAcesso, BannerPerfil>> = {
  3: {
    perfil: 'Planejador',
    texto: ' — acesso operacional completo, exceto Agentes de IA e Controle de Acesso.',
    classes: 'border-apsen-blue-soft-b bg-apsen-kpi-blue text-apsen-blue',
  },
  2: {
    perfil: 'Área',
    texto:
      ' — pode registrar drivers e consultar análises. Ciclos, restrições e planos de produção estão disponíveis apenas para o Planejador.',
    classes: 'border-apsen-teal-soft-b bg-apsen-teal-soft text-apsen-cyan',
  },
  1: {
    perfil: 'Visualizador',
    texto: ' — acesso somente leitura. Disponível: Dashboard, Plano de Produção e Relatórios.',
    classes: 'border-apsen-border bg-apsen-bg text-apsen-muted',
  },
};
