import type { PeriodPreset } from '@application/campaigns/periodPresets';
import type { CampaignStatus } from '@domain/campaign/CampaignStatus';
import type { Channel } from '@domain/campaign/Channel';

export const CHANNEL_LABELS: Record<Channel, string> = {
  google: 'Google Ads',
  meta: 'Meta Ads',
  linkedin: 'LinkedIn Ads',
  email: 'E-mail',
  tiktok: 'TikTok Ads',
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  ativa: 'Ativa',
  pausada: 'Pausada',
  encerrada: 'Encerrada',
};

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  all: 'Todo o período',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  ytd: 'Ano atual',
};
