import { DashboardScreen } from '@presentation/features/dashboard/DashboardScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return <DashboardScreen />;
}
