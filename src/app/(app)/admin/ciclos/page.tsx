import { CiclosScreen } from '@presentation/features/ciclos/CiclosScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ciclos de Planejamento' };

export default function CiclosPage() {
  return <CiclosScreen />;
}
