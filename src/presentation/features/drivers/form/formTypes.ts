import type { DriverFormLookupsDto } from '@application/drivers/dto';
import type { DraftCampo, DriverDraft } from '@domain/drivers/draft';

export type FormMode = 'new' | 'view' | 'edit';

export type FieldErrors = Partial<Record<DraftCampo, string>>;

export type DraftUpdater = (fn: (draft: DriverDraft) => DriverDraft) => void;

export interface CardProps {
  draft: DriverDraft;
  update: DraftUpdater;
  errors: FieldErrors;
  disabled: boolean;
  lookups: DriverFormLookupsDto;
}

export const BOX_TEAL =
  'mb-[14px] rounded-[8px] border border-apsen-border border-l-[3px] border-l-apsen-teal bg-apsen-bg px-[14px] py-[12px]';

export const BOX_TITLE =
  'flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[.06em] text-apsen-teal';
