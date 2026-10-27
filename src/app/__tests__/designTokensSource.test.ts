import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const FILES = sourceFiles(SRC).map((path) => relative(SRC, path));
const PALETTE =
  /\b(bg|text|border|fill|stroke|from|to|ring|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/;

describe('código-fonte sem cores soltas', () => {
  it('encontra os arquivos de código', () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  it.each(FILES)('%s usa só tokens apsen-*', (file) => {
    const source = readFileSync(join(SRC, file), 'utf-8');
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\w-\[(#|rgba?\()/);
    expect(source).not.toMatch(PALETTE);
  });
});
