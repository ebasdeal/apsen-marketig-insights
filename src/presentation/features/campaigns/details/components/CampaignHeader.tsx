import type { CampaignDetailsOutput } from '@application/campaigns/dto';
import { StatusBadge } from '@presentation/components/ui';
import { formatPeriod } from '@presentation/format/formatters';
import { CHANNEL_LABELS } from '@presentation/format/labels';

interface CampaignHeaderProps {
  campaign: CampaignDetailsOutput;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <header className="mb-[16px] flex flex-wrap items-center justify-between gap-[10px]">
      <div>
        <h1 className="page-title">{campaign.name}</h1>
        <p className="page-sub">
          Canal: <strong>{CHANNEL_LABELS[campaign.channel]}</strong> · Período:{' '}
          <strong>{formatPeriod(campaign.periodStart, campaign.periodEnd)}</strong>
          {` · ${campaign.durationDays} dias · ${campaign.id}`}
        </p>
      </div>
      <div className="flex items-center gap-[8px]">
        <StatusBadge status={campaign.status} size="lg" />
      </div>
    </header>
  );
}
