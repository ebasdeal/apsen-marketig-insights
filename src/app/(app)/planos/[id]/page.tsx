import { PlanoItemScreen } from '@presentation/features/planos/PlanoItemScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Detalhe do Item' };

export default async function PlanoItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanoItemScreen id={decodeURIComponent(id)} />;
}
