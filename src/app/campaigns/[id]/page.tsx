import { CampaignDetailsScreen } from '@presentation/features/campaigns/details/CampaignDetailsScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Detalhe da campanha' };

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = await params;
  return <CampaignDetailsScreen id={id} />;
}
