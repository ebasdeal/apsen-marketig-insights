import type { CampaignStatus } from '@domain/campaign/CampaignStatus';
import { STATUS_LABELS } from '@presentation/format/labels';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  ativa: 'text-apsen-green',
  pausada: 'text-apsen-orange',
  encerrada: 'text-apsen-muted',
};

interface CampaignStatusTextProps {
  status: CampaignStatus;
}

export function CampaignStatusText({ status }: CampaignStatusTextProps) {
  return (
    <span data-status={status} className={`text-[12px] font-semibold ${STATUS_COLORS[status]}`}>
      {`● ${STATUS_LABELS[status]}`}
    </span>
  );
}
