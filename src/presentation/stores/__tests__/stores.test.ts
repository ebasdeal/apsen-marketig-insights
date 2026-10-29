import { SESSOES } from '@test/fixtures/sessao';
import {
  INITIAL_SESSAO_STATE,
  SESSAO_STORAGE_KEY,
  expirarSessao,
  rehydrateSessao,
  tokenAtual,
  useSessaoStore,
} from '../sessaoStore';
import { INITIAL_SIDEBAR_STATE, useSidebarStore } from '../sidebarStore';
import { THEME_STORAGE_KEY, rehydrateThemePreference, useThemeStore } from '../themeStore';

describe('sessaoStore', () => {
  beforeEach(() => {
    useSessaoStore.setState(INITIAL_SESSAO_STATE);
    window.sessionStorage.clear();
  });

  it('guarda só token e usuário no sessionStorage, nunca no localStorage', () => {
    useSessaoStore.getState().iniciar(SESSOES.planejador);
    expect(tokenAtual()).toBe('tok-planejador');
    const stored = JSON.parse(window.sessionStorage.getItem(SESSAO_STORAGE_KEY) ?? 'null');
    expect(stored.state).toEqual({ sessao: SESSOES.planejador });
    expect(JSON.stringify({ ...window.localStorage })).not.toContain('tok-planejador');
  });

  it('expirar e encerrar limpam a sessão', () => {
    expirarSessao();
    expect(useSessaoStore.getState().sessao).toBeNull();
    useSessaoStore.getState().iniciar(SESSOES.admin);
    expirarSessao();
    expect(tokenAtual()).toBeUndefined();
    useSessaoStore.getState().iniciar(SESSOES.admin);
    useSessaoStore.getState().encerrar();
    expect(useSessaoStore.getState().sessao).toBeNull();
  });

  it('atualiza o usuário só com sessão ativa', () => {
    useSessaoStore.getState().atualizarUsuario(SESSOES.area.usuario);
    expect(useSessaoStore.getState().sessao).toBeNull();
    useSessaoStore.getState().iniciar(SESSOES.admin);
    useSessaoStore.getState().atualizarUsuario({ ...SESSOES.admin.usuario, nome: 'Ana A.' });
    expect(useSessaoStore.getState().sessao).toMatchObject({
      token: 'tok-admin',
      usuario: { nome: 'Ana A.' },
    });
  });

  it('reidrata a sessão salva no F5 e marca como hidratado', async () => {
    window.sessionStorage.setItem(
      SESSAO_STORAGE_KEY,
      JSON.stringify({ state: { sessao: SESSOES.area }, version: 0 }),
    );
    expect(useSessaoStore.getState().hidratado).toBe(false);
    rehydrateSessao();
    await vi.waitFor(() => expect(useSessaoStore.getState().hidratado).toBe(true));
    expect(useSessaoStore.getState().sessao).toEqual(SESSOES.area);
  });
});

describe('sidebarStore', () => {
  it('guarda a escolha de abertura e do accordion', () => {
    expect(useSidebarStore.getState()).toMatchObject(INITIAL_SIDEBAR_STATE);
    useSidebarStore.getState().setOpenChoice(false);
    useSidebarStore.getState().setAccordion('analises', '/');
    expect(useSidebarStore.getState()).toMatchObject({
      openChoice: false,
      accordion: { module: 'analises', atPath: '/' },
    });
    expect(JSON.stringify({ ...window.localStorage })).not.toContain('analises');
  });
});

describe('themeStore', () => {
  it('alterna entre sistema, claro e escuro', () => {
    expect(useThemeStore.getState().preference).toBe('system');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('light');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('dark');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('define preferência explicitamente', () => {
    useThemeStore.getState().setPreference('dark');
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('persiste somente a preferência no localStorage', () => {
    useThemeStore.getState().setPreference('light');
    const stored = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null');
    expect(THEME_STORAGE_KEY).toBe('marketing-insights:theme');
    expect(stored.state).toEqual({ preference: 'light' });
  });

  it('restaura a preferência salva ao reidratar', async () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ state: { preference: 'dark' }, version: 0 }),
    );
    rehydrateThemePreference();
    await vi.waitFor(() => expect(useThemeStore.getState().preference).toBe('dark'));
    expect(typeof useThemeStore.getState().cycle).toBe('function');
  });
});
