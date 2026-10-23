import { PERIOD_PRESETS, type PeriodPreset } from '@application/campaigns/periodPresets';
import { CAMPAIGN_STATUSES, type CampaignStatus } from '@domain/campaign/CampaignStatus';
import { CHANNELS, type Channel } from '@domain/campaign/Channel';
import type { SelectOption } from '@presentation/components/ui';
import { CHANNEL_LABELS, PERIOD_LABELS, STATUS_LABELS } from '@presentation/format/labels';

export const ALL_OPTION = '';

export type ChannelFilterValue = Channel | typeof ALL_OPTION;
export type StatusFilterValue = CampaignStatus | typeof ALL_OPTION;

export const CHANNEL_SELECT_OPTIONS: readonly SelectOption<ChannelFilterValue>[] = [
  { value: ALL_OPTION, label: 'Todos os canais' },
  ...CHANNELS.map((channel) => ({ value: channel, label: CHANNEL_LABELS[channel] })),
];

export const STATUS_SELECT_OPTIONS: readonly SelectOption<StatusFilterValue>[] = [
  { value: ALL_OPTION, label: 'Todos os status' },
  ...CAMPAIGN_STATUSES.map((status) => ({ value: status, label: `● ${STATUS_LABELS[status]}` })),
];

export const PERIOD_SELECT_OPTIONS: readonly SelectOption<PeriodPreset>[] = PERIOD_PRESETS.map(
  (preset) => ({ value: preset, label: PERIOD_LABELS[preset] }),
);

export function toSelectValue<T extends string>(value: T | null): T | typeof ALL_OPTION {
  return value ?? ALL_OPTION;
}

export function fromSelectValue<T extends string>(value: T | typeof ALL_OPTION): T | null {
  return value === ALL_OPTION ? null : (value as T);
}
