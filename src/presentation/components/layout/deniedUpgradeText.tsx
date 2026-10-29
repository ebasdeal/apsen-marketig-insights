import { upgradeNivel } from '@domain/perfis/acesso';
import type { NivelAcesso } from '@domain/perfis/Perfil';
import type { ReactNode } from 'react';

export function deniedUpgradeText(nivel: NivelAcesso): ReactNode {
  switch (upgradeNivel(nivel)) {
    case 'area-ou-planejador':
      return (
        <>
          Solicite acesso de <strong>Área</strong> para registrar drivers e análises, ou{' '}
          <strong>Planejador</strong> para acesso operacional completo.
        </>
      );
    case 'planejador':
      return (
        <>
          Solicite acesso de <strong>Planejador</strong> para acessar ciclos, restrições, aprovações
          e exportações.
        </>
      );
    case 'admin':
      return (
        <>
          Solicite acesso de <strong>Admin</strong> para gerenciar agentes de IA e controle de
          acesso.
        </>
      );
    default:
      return null;
  }
}
