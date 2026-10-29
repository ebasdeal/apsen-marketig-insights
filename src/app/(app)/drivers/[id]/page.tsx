import { firstParam } from '@presentation/features/drivers/driverRoutes';
import { DriverFormScreen } from '@presentation/features/drivers/form/DriverFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Visualizar Driver' };

interface DriverPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ familia?: string | string[] }>;
}

export default async function DriverPage({ params, searchParams }: DriverPageProps) {
  const { id } = await params;
  const familia = firstParam((await searchParams).familia);
  return (
    <DriverFormScreen
      key={`view:${id}:${familia ?? ''}`}
      mode="view"
      driverId={id}
      familia={familia}
    />
  );
}
