import { AnaliseViewScreen } from '@presentation/features/analises/AnaliseViewScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Análise' };

export default async function AnalisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnaliseViewScreen id={decodeURIComponent(id)} />;
}
