import { FontesScreen } from '@presentation/features/fontes/FontesScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Fontes de Dados / APIs' };

export default function FontesPage() {
  return <FontesScreen />;
}
