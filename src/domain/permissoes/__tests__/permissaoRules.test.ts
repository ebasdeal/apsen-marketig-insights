import db from '../../../../mock-api/db.json';
import type { Permissao } from '../Permissao';
import { agruparPermissoes, celula } from '../permissaoRules';

const PERMISSOES: Permissao[] = db.permissoes.map((p) => ({ ...p, id: String(p.id) }));

describe('permissaoRules (RN-07)', () => {
  it('dado as 11 permissões, quando agrupa, então 3 grupos na ordem de aparição', () => {
    const grupos = agruparPermissoes(PERMISSOES);
    expect(grupos.map((g) => [g.grupo, g.permissoes.length])).toEqual([
      ['Drivers de Demanda', 4],
      ['Administração DI', 5],
      ['Controle de Acesso', 2],
    ]);
  });

  it('lista vazia não tem grupos', () => {
    expect(agruparPermissoes([])).toEqual([]);
  });

  it('classifica as células', () => {
    expect(celula('✓')).toEqual({ kind: 'sim', texto: '✓' });
    expect(celula('—')).toEqual({ kind: 'nao', texto: '—' });
    expect(celula('✓ (só suas cat.)')).toEqual({
      kind: 'parcial',
      texto: '✓',
      detalhe: '(só suas cat.)',
    });
  });
});
