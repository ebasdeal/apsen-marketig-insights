import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../globals.css'), 'utf-8');

describe('app/globals.css', () => {
  it('define os tokens apsen e remove os tokens brand', () => {
    expect(css).not.toMatch(/brand-/);
    expect(css).toContain('--color-apsen-blue: #0a13b6;');
    expect(css).toContain('--color-apsen-border: #e1e1e1;');
    expect(css).toContain('--spacing-sidebar: 252px;');
    expect(css).toContain('--spacing-topbar: 64px;');
    expect(css).toContain('--radius-apsen-lg: 16px;');
  });

  it('corrige as armadilhas do preflight e as transições', () => {
    expect(css).toContain('line-height: normal;');
    expect(css).toMatch(/svg \{\s*display: inline-block;\s*vertical-align: middle;/);
    expect(css).toContain('--default-transition-duration: 140ms;');
    expect(css).toContain('--default-transition-timing-function: ease;');
    expect(css).not.toContain('antialiased');
    expect(css).not.toContain('@theme inline');
  });

  it('mantém as utilities focus-ring, surface e field-focus', () => {
    expect(css).toContain('@utility focus-ring');
    expect(css).toContain('@utility surface');
    expect(css).toContain('@utility field-focus');
  });

  it('define as utilities compartilhadas de título, grade de KPIs e estados', () => {
    expect(css).toMatch(/@utility page-title \{\s*@apply text-\[18px\] font-bold leading-\[1\.2\]/);
    expect(css).toMatch(/@utility page-sub \{\s*@apply mt-\[3px\] text-\[12\.5px\]/);
    expect(css).toMatch(/@utility kpi-grid \{\s*@apply mb-\[20px\] grid grid-cols-4 gap-\[14px\]/);
    expect(css).toMatch(/@utility state-block \{\s*@apply px-\[24px\] py-\[48px\] text-center/);
  });

  it('redefine os tokens no tema escuro', () => {
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-white: #1a1b1f;/);
  });

  it('define os tokens laranja das seções e do badge do Detalhe nos dois temas', () => {
    expect(css).toContain('--color-apsen-orange-soft: #fff7ed;');
    expect(css).toContain('--color-apsen-orange-b: #fed7aa;');
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-orange-soft: #2e1c12;/);
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-orange-b: #7a4426;/);
  });

  it('mantém os tokens do :root do protótipo', () => {
    expect(css).toContain('--color-apsen-teal: #0077be;');
    expect(css).toContain('--color-apsen-purple-b: #c4b5fd;');
    expect(css).toContain('--radius-apsen: 8px;');
    expect(css).toContain('--radius-apsen-pill: 24px;');
    expect(css).toContain('--shadow-apsen-sm: 0 2px 4px 0 rgba(20, 20, 20, 0.08);');
    expect(css).toContain('--shadow-apsen-md: 0 6px 10px 0 rgba(20, 20, 20, 0.08);');
  });

  it('dá par escuro a toda cor e sombra, exceto as cores categóricas dos canais', () => {
    const block = (selector: RegExp) => css.match(selector)?.[1] ?? '';
    const names = (source: string) =>
      new Set(
        Array.from(source.matchAll(/--((?:color|shadow)-apsen-[\w-]+):/g), (match) => match[1]),
      );
    const light = names(block(/@theme \{([\s\S]*?)\n\}/));
    const dark = names(block(/html\.dark \{([\s\S]*?)\n\}/));
    const missing = [...light].filter(
      (name) => !dark.has(name) && !name?.startsWith('color-apsen-ch-'),
    );
    expect(light.size).toBeGreaterThan(40);
    expect(missing).toEqual([]);
    expect(css).toMatch(
      /html\.dark \{[^}]*--shadow-apsen-dropdown: 0 6px 24px rgba\(0, 0, 0, 0\.5\);/,
    );
    expect(css).toMatch(
      /html\.dark \{[^}]*--shadow-apsen-modal: 0 20px 40px rgba\(0, 0, 0, 0\.6\);/,
    );
  });

  it.each([['avatar-muted', '#6f6f6f', '#5c5c5c']])(
    'define o token %s nos dois temas',
    (name, light, dark) => {
      const theme = css.match(/@theme \{([\s\S]*?)\n\}/)?.[1] ?? '';
      const darkBlock = css.match(/html\.dark \{([\s\S]*?)\n\}/)?.[1] ?? '';
      expect(theme).toContain(`--color-apsen-${name}: ${light};`);
      expect(darkBlock).toContain(`--color-apsen-${name}: ${dark};`);
    },
  );

  it('não tem mais a role bar e define as animações do toast e do login', () => {
    expect(css).not.toContain('rolebar');
    expect(css).toContain('@keyframes apsen-toast-in');
    expect(css).toContain('@keyframes apsen-toast-progress');
    expect(css).toContain('@keyframes apsen-fade-up');
  });

  it('define os tokens do tooltip nos dois temas', () => {
    expect(css).toContain('--color-apsen-tip-bg: #1e293b;');
    expect(css).toContain('--color-apsen-tip-fg: #cbd5e1;');
    expect(css).toContain('--color-apsen-tip-strong: #f8fafc;');
    expect(css).toContain('--color-apsen-tip-em: #7dd3fc;');
    expect(css).toContain('--shadow-apsen-tip: 0 8px 28px rgba(0, 0, 0, 0.28);');
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-tip-bg: #2b3446;/);
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-tip-fg: #d5dbe5;/);
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-tip-strong: #f8fafc;/);
    expect(css).toMatch(/html\.dark \{[^}]*--color-apsen-tip-em: #7dd3fc;/);
    expect(css).toMatch(/html\.dark \{[^}]*--shadow-apsen-tip: 0 8px 28px rgba\(0, 0, 0, 0\.6\);/);
  });
});
