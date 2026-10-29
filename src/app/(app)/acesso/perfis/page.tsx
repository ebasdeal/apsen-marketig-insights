import { PerfisScreen } from '@presentation/features/perfis/PerfisScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Perfis de Acesso' };

export default function PerfisPage() {
  return <PerfisScreen />;
}
