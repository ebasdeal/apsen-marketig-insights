import { AgenteFormScreen } from '@presentation/features/agentes/AgenteFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar Agente' };

export default async function EditarAgentePage({ params }: PageProps<'/agentes/[id]/editar'>) {
  const { id } = await params;
  return <AgenteFormScreen id={id} />;
}
