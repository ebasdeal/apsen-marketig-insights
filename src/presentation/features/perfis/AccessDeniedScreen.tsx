'use client';

import { AccessDenied } from '../../components/layout/AccessDenied';
import { usePerfilAtual } from '../../hooks/usePerfilAtual';

export function AccessDeniedScreen() {
  const { perfil } = usePerfilAtual();
  return <AccessDenied perfil={perfil} />;
}
