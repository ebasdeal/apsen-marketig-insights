import { CICLOS_RESUMO_FIXTURE } from '@test/fixtures/ciclos';
import { initialCicloForm, isCicloFormDirty, responsavelOptions } from '../cicloForm';
import { ativosLabel, ciclosLabel } from '../components/CiclosSummary';

describe('cicloForm', () => {
  it('detecta alterações', () => {
    const initial = initialCicloForm({ modo: 'novo' }, CICLOS_RESUMO_FIXTURE);
    expect(isCicloFormDirty(initial, initial)).toBe(false);
    expect(isCicloFormDirty({ ...initial, ativar: true }, initial)).toBe(true);
  });

  it('opções de responsável incluem o atual quando fora da lista', () => {
    expect(responsavelOptions('').map((option) => option.value)).toEqual([
      'Ana Planejadora',
      'Carlos Planejador',
    ]);
    expect(responsavelOptions('Bia')).toHaveLength(3);
  });

  it('resumo no singular e plural', () => {
    expect(ciclosLabel(1)).toBe('1 ciclo');
    expect(ciclosLabel(3)).toBe('3 ciclos');
    expect(ativosLabel(1)).toBe('1 ativo');
    expect(ativosLabel(2)).toBe('2 ativos');
  });
});
