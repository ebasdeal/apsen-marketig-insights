import { TipoFormScreen } from '@presentation/features/tipos/TipoFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Novo Tipo' };

export default function NovoTipoPage() {
  return <TipoFormScreen />;
}
