import type { Campaign } from '@domain/campaign/Campaign';
import type { CampaignDto } from './campaignDto';
import { toCampaign } from './campaignMapper';

interface SeedRow {
  id: string;
  name: string;
  channel: CampaignDto['channel'];
  status: CampaignDto['status'];
  startDaysAgo: number;
  durationDays: number;
  budget: number;
  metrics: CampaignDto['metrics'];
}

const SEED: readonly SeedRow[] = [
  {
    id: 'cmp-001',
    name: 'Black Friday – Search Marca',
    channel: 'google',
    status: 'ativa',
    startDaysAgo: 20,
    durationDays: 45,
    budget: 48000,
    metrics: {
      impressions: 1250000,
      clicks: 61200,
      conversions: 3120,
      spend: 39850.4,
      revenue: 214300.9,
    },
  },
  {
    id: 'cmp-002',
    name: 'Remarketing Carrinho Abandonado',
    channel: 'meta',
    status: 'ativa',
    startDaysAgo: 35,
    durationDays: 60,
    budget: 22000,
    metrics: {
      impressions: 2840000,
      clicks: 42600,
      conversions: 1980,
      spend: 18420.75,
      revenue: 97350.2,
    },
  },
  {
    id: 'cmp-003',
    name: 'Lead Gen – Decisores de TI',
    channel: 'linkedin',
    status: 'ativa',
    startDaysAgo: 28,
    durationDays: 56,
    budget: 35000,
    metrics: {
      impressions: 410000,
      clicks: 5330,
      conversions: 214,
      spend: 31210.0,
      revenue: 88900.0,
    },
  },
  {
    id: 'cmp-004',
    name: 'Newsletter Lançamento Coleção',
    channel: 'email',
    status: 'encerrada',
    startDaysAgo: 70,
    durationDays: 14,
    budget: 3500,
    metrics: {
      impressions: 180000,
      clicks: 21600,
      conversions: 1420,
      spend: 2980.0,
      revenue: 61240.5,
    },
  },
  {
    id: 'cmp-005',
    name: 'Awareness Gen Z – Creators',
    channel: 'tiktok',
    status: 'ativa',
    startDaysAgo: 12,
    durationDays: 30,
    budget: 26000,
    metrics: {
      impressions: 5320000,
      clicks: 38900,
      conversions: 610,
      spend: 14870.3,
      revenue: 21950.0,
    },
  },
  {
    id: 'cmp-006',
    name: 'Shopping – Linha Premium',
    channel: 'google',
    status: 'pausada',
    startDaysAgo: 60,
    durationDays: 90,
    budget: 30000,
    metrics: {
      impressions: 690000,
      clicks: 24150,
      conversions: 905,
      spend: 21340.0,
      revenue: 58720.0,
    },
  },
  {
    id: 'cmp-007',
    name: 'Prospecção Lookalike 2%',
    channel: 'meta',
    status: 'encerrada',
    startDaysAgo: 120,
    durationDays: 30,
    budget: 15000,
    metrics: {
      impressions: 1940000,
      clicks: 23280,
      conversions: 520,
      spend: 15880.9,
      revenue: 26440.0,
    },
  },
  {
    id: 'cmp-008',
    name: 'Webinar Produto Enterprise',
    channel: 'linkedin',
    status: 'encerrada',
    startDaysAgo: 150,
    durationDays: 21,
    budget: 12000,
    metrics: {
      impressions: 152000,
      clicks: 1820,
      conversions: 96,
      spend: 12640.0,
      revenue: 19200.0,
    },
  },
  {
    id: 'cmp-009',
    name: 'Reativação Clientes Inativos',
    channel: 'email',
    status: 'ativa',
    startDaysAgo: 8,
    durationDays: 20,
    budget: 2500,
    metrics: {
      impressions: 96000,
      clicks: 11040,
      conversions: 640,
      spend: 1120.0,
      revenue: 33800.0,
    },
  },
  {
    id: 'cmp-010',
    name: 'Desafio de Hashtag Verão',
    channel: 'tiktok',
    status: 'encerrada',
    startDaysAgo: 260,
    durationDays: 25,
    budget: 18000,
    metrics: {
      impressions: 3870000,
      clicks: 25110,
      conversions: 280,
      spend: 18000.0,
      revenue: 9800.0,
    },
  },
  {
    id: 'cmp-011',
    name: 'Search Genérico – Concorrência',
    channel: 'google',
    status: 'ativa',
    startDaysAgo: 40,
    durationDays: 120,
    budget: 20000,
    metrics: {
      impressions: 520000,
      clicks: 12480,
      conversions: 290,
      spend: 21890.5,
      revenue: 17540.0,
    },
  },
  {
    id: 'cmp-012',
    name: 'Vídeo Institucional Stories',
    channel: 'meta',
    status: 'pausada',
    startDaysAgo: 90,
    durationDays: 45,
    budget: 9000,
    metrics: {
      impressions: 1210000,
      clicks: 6050,
      conversions: 48,
      spend: 7420.0,
      revenue: 2860.0,
    },
  },
  {
    id: 'cmp-013',
    name: 'Teste A/B Criativos Q4',
    channel: 'tiktok',
    status: 'ativa',
    startDaysAgo: 2,
    durationDays: 28,
    budget: 8000,
    metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
  },
  {
    id: 'cmp-014',
    name: 'Nurturing Trial → Pago',
    channel: 'email',
    status: 'encerrada',
    startDaysAgo: 200,
    durationDays: 60,
    budget: 4200,
    metrics: {
      impressions: 240000,
      clicks: 26400,
      conversions: 1310,
      spend: 3890.0,
      revenue: 72100.0,
    },
  },
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function createMockCampaignDtos(referenceDate: Date): CampaignDto[] {
  const today = startOfUtcDay(referenceDate).getTime();
  return SEED.map(({ startDaysAgo, durationDays, ...row }) => {
    const start = today - startDaysAgo * DAY_IN_MS;
    return {
      ...row,
      period: {
        start: new Date(start).toISOString(),
        end: new Date(start + (durationDays - 1) * DAY_IN_MS).toISOString(),
      },
      metrics: { ...row.metrics },
    };
  });
}

export function createMockCampaigns(referenceDate: Date): Campaign[] {
  return createMockCampaignDtos(referenceDate).map(toCampaign);
}
