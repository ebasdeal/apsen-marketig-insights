import type { PerfilId } from '@domain/perfis/Perfil';
import { INITIAL_SESSAO_STATE, useSessaoStore } from '@presentation/stores/sessaoStore';
import { INITIAL_SIDEBAR_STATE, useSidebarStore } from '@presentation/stores/sidebarStore';
import { useThemeStore } from '@presentation/stores/themeStore';
import { SESSOES } from './fixtures/sessao';

export function loginAs(perfil: PerfilId): void {
  useSessaoStore.setState({ sessao: SESSOES[perfil], hidratado: true });
}

export function logout(): void {
  useSessaoStore.setState({ ...INITIAL_SESSAO_STATE, hidratado: true });
}

export function resetStores(): void {
  useSessaoStore.setState(INITIAL_SESSAO_STATE);
  loginAs('admin');
  useSidebarStore.setState(INITIAL_SIDEBAR_STATE);
  useThemeStore.setState({ preference: 'system' });
}
