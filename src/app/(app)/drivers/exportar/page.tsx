import { DriversExportScreen } from '@presentation/features/drivers/export/DriversExportScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Exportar JSON' };

export default function ExportarPage() {
  return <DriversExportScreen />;
}
