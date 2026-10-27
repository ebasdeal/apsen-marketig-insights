import { UsuarioFormScreen } from '@presentation/features/usuarios/UsuarioFormScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar Usuário' };

export default async function EditarUsuarioPage({
  params,
}: PageProps<'/acesso/usuarios/[id]/editar'>) {
  const { id } = await params;
  return <UsuarioFormScreen id={id} />;
}
