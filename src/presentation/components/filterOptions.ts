import { PERIOD_PRESETS, type PeriodPreset } from '@application/campaigns/periodPresets';
import { PERIOD_LABELS } from '../format/labels';
import type { ChipOption } from './ui/ChipGroup';

export const PERIOD_OPTIONS: readonly ChipOption<PeriodPreset>[] = PERIOD_PRESETS.map((preset) => ({
  value: preset,
  label: PERIOD_LABELS[preset],
}));
