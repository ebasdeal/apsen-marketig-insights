import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const UI = resolve(__dirname, '..');
const read = (file: string) => readFileSync(resolve(UI, file), 'utf-8');

const CLIENT = [
  'FormField.tsx',
  'TextInput.tsx',
  'Modal.tsx',
  'Tooltip.tsx',
  'Toggle.tsx',
  'Tabs.tsx',
];
const SERVER = ['FormGrid.tsx', 'Table.tsx', 'Alert.tsx'];
const SUPPORT = ['fieldClasses.ts', 'useFocusTrap.ts', 'tabKeys.ts'];
const FILES = [...CLIENT, ...SERVER, ...SUPPORT];

describe('código-fonte dos componentes base', () => {
  it.each(FILES)('%s usa só tokens apsen', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\bdark:/);
    expect(source).not.toMatch(
      /\b(bg|text|border)-(slate|gray|zinc|neutral|red|green|blue|yellow|amber|emerald)-\d/,
    );
  });

  it.each(FILES)('%s tem até 120 linhas e nenhum comentário', (file) => {
    const source = read(file);
    expect(source.split('\n').length).toBeLessThanOrEqual(120);
    expect(source).not.toMatch(/^\s*\/\/|\/\*/m);
  });

  it('marca use client só nos componentes com estado, efeito, contexto ou handler', () => {
    CLIENT.forEach((file) => expect(read(file).startsWith("'use client';")).toBe(true));
    SERVER.forEach((file) => expect(read(file)).not.toContain("'use client'"));
  });

  it('não adiciona dependências ao package.json', () => {
    const pkg = JSON.parse(readFileSync(resolve(UI, '../../../../package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
    };
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      '@tanstack/react-query',
      'next',
      'react',
      'react-dom',
      'zod',
      'zustand',
    ]);
  });
});
