'use client';

import { podeAcessar } from '@domain/perfis/acesso';
import { usePathname } from 'next/navigation';
import { usePerfilAtual } from '../hooks/usePerfilAtual';
import { matchScreen, type ScreenDef } from './screens';

export const NOT_FOUND_CRUMB = 'Página não encontrada';

export const DENIED_CRUMB = 'Acesso Negado';

export interface CurrentScreen {
  screen: ScreenDef | null;
  blocked: boolean;
  crumb: string;
}

export function useCurrentScreen(): CurrentScreen {
  const pathname = usePathname();
  const { perfil } = usePerfilAtual();
  const screen = matchScreen(pathname);
  const blocked =
    screen !== null && perfil !== undefined && !podeAcessar(perfil.nivel, screen.nivelMinimo);
  const crumb = blocked ? DENIED_CRUMB : (screen?.crumb ?? NOT_FOUND_CRUMB);
  return { screen, blocked, crumb };
}
