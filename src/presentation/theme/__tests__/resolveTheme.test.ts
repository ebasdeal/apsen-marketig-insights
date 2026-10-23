import { applyTheme, resolveTheme } from '../resolveTheme';

describe('resolveTheme', () => {
  it.each([
    ['system', true, 'dark'],
    ['system', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
  ] as const)('preferência %s com sistema escuro=%s → %s', (preference, systemDark, expected) => {
    expect(resolveTheme(preference, systemDark)).toBe(expected);
  });
});

describe('applyTheme', () => {
  it('adiciona e remove a classe dark', () => {
    const root = document.createElement('div');
    applyTheme(root, 'dark');
    expect(root).toHaveClass('dark');
    applyTheme(root, 'light');
    expect(root).not.toHaveClass('dark');
  });
});
