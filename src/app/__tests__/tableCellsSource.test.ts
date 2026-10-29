import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC = resolve(__dirname, '../..');
const read = (file: string) => readFileSync(join(SRC, file), 'utf-8');

describe('células curtas de tabela não quebram linha', () => {
  it('Table compartilhada aplica nowrap por padrão', () => {
    expect(read('presentation/components/ui/tableStyles.ts')).toMatch(
      /NOWRAP = 'whitespace-nowrap'/,
    );
  });

  it.each([
    ['código', '{item.codigo}</span>'],
    ['linha', '{item.linha}'],
    ['semana', '{item.semana}'],
    ['status', '{item.statusLabel}'],
  ])('Planos: célula de %s usa nowrap', (_nome, ancora) => {
    const source = read('presentation/features/planos/components/PlanoItemRow.tsx');
    const antes = source.slice(0, source.indexOf(ancora));
    const ultimaCelula = antes.slice(antes.lastIndexOf('<StackedCell'));
    expect(ultimaCelula).toContain('TD_CURTO');
  });
});
