import type { PeriodInput } from './dto';

export const PERIOD_PRESETS = ['all', '30d', '90d', 'ytd'] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function daysBack(now: Date, days: number): PeriodInput {
  return {
    start: new Date(now.getTime() - (days - 1) * DAY_IN_MS).toISOString(),
    end: now.toISOString(),
  };
}

export function resolvePeriodPreset(preset: PeriodPreset, now: Date): PeriodInput | undefined {
  switch (preset) {
    case 'all':
      return undefined;
    case '30d':
      return daysBack(now, 30);
    case '90d':
      return daysBack(now, 90);
    case 'ytd':
      return {
        start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString(),
        end: now.toISOString(),
      };
  }
}
