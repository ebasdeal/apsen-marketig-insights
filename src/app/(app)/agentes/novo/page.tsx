import { AgenteFormScreen } from '@presentation/features/agentes/AgenteFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Novo Agente' };

export default function NovoAgentePage() {
  return <AgenteFormScreen />;
}
