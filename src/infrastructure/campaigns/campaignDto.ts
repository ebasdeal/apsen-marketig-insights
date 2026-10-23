import { CAMPAIGN_STATUSES } from '@domain/campaign/CampaignStatus';
import { CHANNELS } from '@domain/campaign/Channel';
import { z } from 'zod';

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Data ISO inválida' });

const count = z.number().int().nonnegative();
const amount = z.number().nonnegative();

export const campaignDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  channel: z.enum(CHANNELS),
  status: z.enum(CAMPAIGN_STATUSES),
  period: z.object({ start: isoDate, end: isoDate }),
  budget: amount,
  metrics: z.object({
    impressions: count,
    clicks: count,
    conversions: count,
    spend: amount,
    revenue: amount,
  }),
});

export const campaignListResponseSchema = z.object({
  data: z.array(campaignDtoSchema),
});

export type CampaignDto = z.infer<typeof campaignDtoSchema>;
export type CampaignListResponse = z.infer<typeof campaignListResponseSchema>;
