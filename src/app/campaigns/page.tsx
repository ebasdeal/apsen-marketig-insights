import { CampaignListScreen } from '@presentation/features/campaigns/CampaignListScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Campanhas' };

export default function CampaignsPage() {
  return <CampaignListScreen />;
}
