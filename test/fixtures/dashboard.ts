import type { DashboardOverviewOutput } from '@application/dashboard/dto';
import { toDashboardOutput } from '@application/dashboard/GetDashboardOverview';
import type { DashboardOverview } from '@domain/dashboard/DashboardOverview';

export const DASHBOARD_API = {
  atualizadoEm: '2026-10-27T13:05:00.000Z',
  cicloAtivo: { id: 'PLP-2026-07', descricao: 'Planejamento Julho 2026' },
  pipeline: { total: 14, pendentes: 2 },
  restricoes: {
    ativas: 8,
    criticas: 3,
    porTipo: [
      { tipo: 'mp', label: 'Matéria-Prima', n: 2 },
      { tipo: 'capacidade', label: 'Capacidade', n: 1 },
    ],
  },
  plano: {
    total: 247,
    aprovados: 107,
    porStatus: { aprovado: 107, revisao: 70, bloqueado: 35, pendente: 35 },
  },
  analises: { total: 2, salvas: 2 },
  driversPorCategoria: [
    { categoria: 'midia', label: 'Mídia / Digital', n: 3 },
    { categoria: 'comercial', label: 'Comercial / Trade', n: 4 },
    { categoria: 'supply', label: 'Supply / MP', n: 2 },
    { categoria: 'regulatorio', label: 'Regulatório', n: 1 },
    { categoria: 'sazo', label: 'Sazonalidade', n: 2 },
    { categoria: 'concorrencia', label: 'Concorrência', n: 0 },
  ],
  aguardandoAprovacao: {
    total: 6,
    itens: [
      {
        id: 'DRV-2026-034',
        produto: 'Baricitinibe 2mg — Blister 28cp',
        tipo: '💻 Digital / Redes',
      },
      { id: 'DRV-2026-033', produto: 'Baricitinibe (todos os SKUs)', tipo: '🚫 Restrição ANVISA' },
      { id: 'DRV-2026-030', produto: 'Apixabana · Cardio', tipo: '🛒 PDV' },
      { id: 'DRV-2026-029', produto: 'Upadacitinibe 15mg', tipo: '⚗️ Falta MP' },
    ],
  },
};

export function buildDashboardOverview(
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  const api = DASHBOARD_API;
  return {
    atualizadoEm: api.atualizadoEm,
    cicloAtivo: api.cicloAtivo,
    pipeline: api.pipeline,
    restricoes: {
      ativas: api.restricoes.ativas,
      criticas: api.restricoes.criticas,
      porTipo: api.restricoes.porTipo.map(({ tipo, label, n }) => ({ chave: tipo, label, n })),
    },
    plano: api.plano,
    analises: api.analises,
    driversPorCategoria: api.driversPorCategoria.map(({ categoria, label, n }) => ({
      chave: categoria,
      label,
      n,
    })),
    aguardandoAprovacao: api.aguardandoAprovacao,
    ...overrides,
  };
}

export function buildDashboardOutput(
  overrides: Partial<DashboardOverview> = {},
): DashboardOverviewOutput {
  return toDashboardOutput(buildDashboardOverview(overrides));
}
