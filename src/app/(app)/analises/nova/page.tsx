import { NovaAnaliseScreen } from '@presentation/features/analises/NovaAnaliseScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nova Análise' };

export default function NovaAnalisePage() {
  return <NovaAnaliseScreen />;
}
