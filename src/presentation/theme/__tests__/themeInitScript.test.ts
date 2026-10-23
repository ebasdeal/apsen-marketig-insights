import { THEME_STORAGE_KEY } from '../../stores/themeStore';
import { themeInitScript } from '../themeInitScript';
import { stubMatchMedia } from './matchMediaStub';

function runScript(): void {
  new Function(themeInitScript)();
}

function storePreference(preference: string): void {
  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ state: { preference }, version: 0 }),
  );
}

describe('themeInitScript', () => {
  it('aplica escuro quando a preferência salva é dark', () => {
    storePreference('dark');
    runScript();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('aplica claro quando a preferência salva é light mesmo com sistema escuro', () => {
    stubMatchMedia(true);
    document.documentElement.classList.add('dark');
    storePreference('light');
    runScript();
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('segue o sistema sem preferência salva', () => {
    stubMatchMedia(true);
    runScript();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('segue o sistema quando a preferência salva é inválida', () => {
    stubMatchMedia(false);
    storePreference('roxo');
    runScript();
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('ignora conteúdo corrompido sem lançar erro', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, '{quebrado');
    expect(runScript).not.toThrow();
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
