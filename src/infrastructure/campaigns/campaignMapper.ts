import { Campaign } from '@domain/campaign/Campaign';
import { Metrics } from '@domain/campaign/Metrics';
import { DateRange } from '@domain/shared/DateRange';
import { DomainError } from '@domain/shared/DomainError';
import { Money } from '@domain/shared/Money';
import type { z } from 'zod';
import { InvalidResponseError } from '../http/HttpClient';
import type { CampaignDto } from './campaignDto';

export function toCampaign(dto: CampaignDto): Campaign {
  try {
    return Campaign.create({
      id: dto.id,
      name: dto.name,
      channel: dto.channel,
      status: dto.status,
      period: DateRange.fromIso(dto.period.start, dto.period.end),
      budget: Money.of(dto.budget),
      metrics: Metrics.create({
        impressions: dto.metrics.impressions,
        clicks: dto.metrics.clicks,
        conversions: dto.metrics.conversions,
        spend: Money.of(dto.metrics.spend),
        revenue: Money.of(dto.metrics.revenue),
      }),
    });
  } catch (error) {
    if (error instanceof DomainError) {
      throw new InvalidResponseError(`Campanha ${dto.id} inconsistente: ${error.message}`);
    }
    throw error;
  }
}

export function parseWith<T>(schema: z.ZodType<T>, payload: unknown, context: string): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ');
    throw new InvalidResponseError(`Contrato inválido em ${context}: ${details}`);
  }
  return result.data;
}
