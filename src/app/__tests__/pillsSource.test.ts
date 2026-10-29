import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '../..');

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : tsxFiles(path);
    }
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

// Pílula = <span>/<code> com cantos arredondados e padding horizontal e vertical.
const PILL = /<(span|code)\b[^>]*className=\{?[`'"]([^`'"]*rounded-[^`'"]*)[`'"]/g;
const isPill = (classes: string) => /\bpx-/.test(classes) && /\bpy-/.test(classes);

const FILES = tsxFiles(join(SRC, 'presentation')).map((path) => relative(SRC, path));

describe('pílulas não quebram linha dentro de tabelas e cartões', () => {
  it.each(FILES)('%s', (file) => {
    const source = readFileSync(join(SRC, file), 'utf-8');
    const broken = Array.from(source.matchAll(PILL))
      .map((match) => match[2] ?? '')
      .filter((classes) => isPill(classes) && !classes.includes('whitespace-nowrap'));
    expect(broken).toEqual([]);
  });
});
