'use client';

import { Alert } from '../ui/Alert';
import { useSessaoStore } from '../../stores/sessaoStore';

export const SOMENTE_LEITURA_AVISO = 'Seu usuário está inativo: acesso somente para visualização.';

export function ReadOnlyBanner() {
  const inativo = useSessaoStore((state) => state.sessao?.usuario.ativo === false);
  if (!inativo) {
    return null;
  }
  return <Alert tone="warning">{SOMENTE_LEITURA_AVISO}</Alert>;
}
