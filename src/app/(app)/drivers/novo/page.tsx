import { firstParam } from '@presentation/features/drivers/driverRoutes';
import { DriverFormScreen } from '@presentation/features/drivers/form/DriverFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Registrar Driver' };

interface NovoDriverPageProps {
  searchParams: Promise<{ familia?: string | string[] }>;
}

export default async function NovoDriverPage({ searchParams }: NovoDriverPageProps) {
  const familia = firstParam((await searchParams).familia);
  return <DriverFormScreen key={`new::${familia ?? ''}`} mode="new" familia={familia} />;
}
