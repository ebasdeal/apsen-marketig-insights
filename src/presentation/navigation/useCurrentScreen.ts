'use client';

import { podeAcessar } from '@domain/perfis/acesso';
import { usePathname } from 'next/navigation';
import { usePerfilAtual } from '../hooks/usePerfilAtual';
import { matchScreen, type ScreenDef } from './screens';

export const NOT_FOUND_CRUMB = 'Página não encontrada';

export const DENIED_CRUMB = 'Acesso Negado';

const RESERVADOS_DRIVERS = ['novo', 'catalogo', 'exportar'];

function ehEdicao(segments: readonly string[], base: string): boolean {
  return segments.length === 3 && segments[0] === base && segments[2] === 'editar';
}

export function crumbDaRota(pathname: string, padrao: string): string {
  const path = pathname.split(/[?#]/)[0] ?? '';
  const segments = path.split('/').filter((segment) => segment !== '');
  const raiz = segments[0];
  if (raiz === 'drivers' && ehEdicao(segments, 'drivers')) return 'Editar Driver';
  if (
    raiz === 'drivers' &&
    segments.length === 2 &&
    !RESERVADOS_DRIVERS.includes(segments[1] ?? '')
  ) {
    return 'Visualizar Driver';
  }
  if (
    segments[0] === 'admin' &&
    segments[1] === 'tipos' &&
    segments.length === 4 &&
    segments[3] === 'editar'
  ) {
    return 'Editar Tipo';
  }
  if (
    segments[0] === 'acesso' &&
    segments[1] === 'usuarios' &&
    segments.length === 4 &&
    segments[3] === 'editar'
  ) {
    return 'Editar Usuário';
  }
  if (ehEdicao(segments, 'agentes')) return 'Editar Agente';
  return padrao;
}

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
  const crumb = blocked ? DENIED_CRUMB : crumbDaRota(pathname, screen?.crumb ?? NOT_FOUND_CRUMB);
  return { screen, blocked, crumb };
}
