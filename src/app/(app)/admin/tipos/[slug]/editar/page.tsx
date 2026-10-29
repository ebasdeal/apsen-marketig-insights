import { TipoFormScreen } from '@presentation/features/tipos/TipoFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar Tipo' };

interface EditarTipoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditarTipoPage({ params }: EditarTipoPageProps) {
  const { slug } = await params;
  return <TipoFormScreen id={decodeURIComponent(slug)} />;
}
