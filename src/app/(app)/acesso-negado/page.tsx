import { AccessDeniedScreen } from '@presentation/features/perfis/AccessDeniedScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Acesso Negado' };

export default function AccessDeniedPage() {
  return <AccessDeniedScreen />;
}
