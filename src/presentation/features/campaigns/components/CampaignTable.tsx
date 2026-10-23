import type { CampaignListItemOutput } from '@application/campaigns/dto';
import { CampaignRow } from './CampaignRow';

const TH =
  'whitespace-nowrap px-[14px] py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em]';

const HEADERS = [
  { label: 'Código', color: 'text-apsen-blue' },
  { label: 'Campanha / Período', color: 'text-apsen-muted' },
  { label: 'Canal', color: 'text-apsen-muted' },
  { label: 'Status', color: 'text-apsen-muted' },
  { label: 'Investimento', color: 'text-apsen-muted' },
  { label: 'ROAS', color: 'text-apsen-muted' },
  { label: 'Ações', color: 'text-apsen-muted' },
] as const;

interface CampaignTableProps {
  campaigns: readonly CampaignListItemOutput[];
  emptyText: string;
}

export function CampaignTable({ campaigns, emptyText }: CampaignTableProps) {
  return (
    <div className="overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm">
      <table className="w-full min-w-[560px] border-collapse">
        <caption className="sr-only">Campanhas</caption>
        <thead>
          <tr className="border-b border-apsen-border bg-apsen-bg">
            {HEADERS.map((header) => (
              <th key={header.label} scope="col" className={`${TH} ${header.color}`}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td
                colSpan={HEADERS.length}
                className="p-[30px] text-center text-[13px] text-apsen-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            campaigns.map((campaign) => <CampaignRow key={campaign.id} campaign={campaign} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
