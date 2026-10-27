import { firstParam } from '@presentation/features/drivers/driverRoutes';
import { DriverFormScreen } from '@presentation/features/drivers/form/DriverFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar Driver' };

interface EditarDriverPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ familia?: string | string[] }>;
}

export default async function EditarDriverPage({ params, searchParams }: EditarDriverPageProps) {
  const { id } = await params;
  const familia = firstParam((await searchParams).familia);
  return (
    <DriverFormScreen
      key={`edit:${id}:${familia ?? ''}`}
      mode="edit"
      driverId={id}
      familia={familia}
    />
  );
}
