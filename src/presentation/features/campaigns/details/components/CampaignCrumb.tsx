import { ChevronRightIcon, TextLink } from '@presentation/components/ui';
import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';

interface CampaignCrumbProps {
  name: string;
}

export function CampaignCrumb({ name }: CampaignCrumbProps) {
  return (
    <nav
      aria-label="Trilha da campanha"
      className="mb-[10px] flex items-center gap-[5px] text-[12.5px] text-apsen-muted"
    >
      <TextLink href={CAMPAIGNS_ROUTE} variant="crumb">
        Campanhas
      </TextLink>
      <ChevronRightIcon className="size-[11px]" />
      <span aria-current="page" className="font-medium text-apsen-slate">
        {name}
      </span>
    </nav>
  );
}
