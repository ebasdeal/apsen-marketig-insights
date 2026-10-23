import type { CampaignListItemOutput } from '@application/campaigns/dto';
import { ActionGroup, ChannelPill, EyeIcon, IconLink, TextLink } from '@presentation/components/ui';
import { formatCurrency, formatRoas } from '@presentation/format/formatters';
import { campaignDetailsRoute } from '@presentation/navigation/routes';
import { formatShortPeriod } from '../formatShortPeriod';
import { CampaignStatusText } from './CampaignStatusText';

const TD = 'border-b border-apsen-bg px-[14px] py-[12px] align-middle text-[13px]';
const NUMBER_TD = `${TD} font-semibold`;

interface CampaignRowProps {
  campaign: CampaignListItemOutput;
}

export function CampaignRow({ campaign }: CampaignRowProps) {
  return (
    <tr className="hover:bg-apsen-row-hover [&:last-child>td]:border-b-0">
      <td className={TD}>
        <TextLink href={campaignDetailsRoute(campaign.id)} variant="code">
          {campaign.id}
        </TextLink>
      </td>
      <td className={TD}>
        <div className="text-[13px] font-medium">{campaign.name}</div>
        <div className="text-[11.5px] text-apsen-muted">
          {formatShortPeriod(campaign.periodStart, campaign.periodEnd)}
        </div>
      </td>
      <td className={TD}>
        <ChannelPill channel={campaign.channel} />
      </td>
      <td className={TD}>
        <CampaignStatusText status={campaign.status} />
      </td>
      <td className={NUMBER_TD}>{formatCurrency(campaign.spend)}</td>
      <td className={NUMBER_TD}>{formatRoas(campaign.roas)}</td>
      <td className={TD}>
        <ActionGroup>
          <IconLink
            href={campaignDetailsRoute(campaign.id)}
            aria-label={`Abrir campanha ${campaign.name}`}
          >
            <EyeIcon />
          </IconLink>
        </ActionGroup>
      </td>
    </tr>
  );
}
