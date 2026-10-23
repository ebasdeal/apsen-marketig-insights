import type { CampaignListItemOutput } from '@application/campaigns/dto';
import { InlineEmpty } from '@presentation/components/ui';
import { formatRoas } from '@presentation/format/formatters';
import { CHANNEL_LABELS } from '@presentation/format/labels';
import { campaignDetailsRoute } from '@presentation/navigation/routes';
import Link from 'next/link';

interface TopCampaignsListProps {
  campaigns: readonly CampaignListItemOutput[];
}

interface TopCampaignItemProps {
  campaign: CampaignListItemOutput;
}

function TopCampaignItem({ campaign }: TopCampaignItemProps) {
  return (
    <li className="border-b border-apsen-bg last:border-b-0">
      <Link
        href={campaignDetailsRoute(campaign.id)}
        aria-label={`Abrir campanha ${campaign.name}`}
        className="flex items-center gap-[10px] py-[8px] text-[13px] focus-ring"
      >
        <span className="min-w-[95px] font-mono text-[11px] font-semibold text-apsen-blue">
          {campaign.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-apsen-slate">
            {campaign.name}
          </span>
          <span className="block text-[11.5px] text-apsen-muted">
            {CHANNEL_LABELS[campaign.channel]}
          </span>
        </span>
        <span className="text-[13px] font-semibold text-apsen-green">
          {formatRoas(campaign.roas)}
        </span>
      </Link>
    </li>
  );
}

export function TopCampaignsList({ campaigns }: TopCampaignsListProps) {
  if (campaigns.length === 0) {
    return <InlineEmpty>Nenhuma campanha com ROAS no período</InlineEmpty>;
  }
  return (
    <ol aria-label="Top campanhas">
      {campaigns.map((campaign) => (
        <TopCampaignItem key={campaign.id} campaign={campaign} />
      ))}
    </ol>
  );
}
