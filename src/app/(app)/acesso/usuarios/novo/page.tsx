import { UsuarioFormScreen } from '@presentation/features/usuarios/UsuarioFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Novo Usuário' };

export default function NovoUsuarioPage() {
  return <UsuarioFormScreen />;
}
