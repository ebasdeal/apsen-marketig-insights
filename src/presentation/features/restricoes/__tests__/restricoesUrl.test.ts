import { IMPACTO_COR, prazoCor, SEVERIDADE_PILL } from '../restricaoStyles';
import { escreverFiltroRestricoes, lerFiltroRestricoes, RESTRICOES_ROUTE } from '../restricoesUrl';

describe('restricoesUrl (RN-10)', () => {
  it('valores inválidos caem no padrão', () => {
    expect(lerFiltroRestricoes(new URLSearchParams('aba=xyz&pagina=-3'))).toEqual({
      aba: 'ativas',
      pagina: 1,
    });
    expect(lerFiltroRestricoes(new URLSearchParams('aba=resolvidas&pagina=2'))).toEqual({
      aba: 'resolvidas',
      pagina: 2,
    });
  });

  it('escrita omite os padrões', () => {
    expect(escreverFiltroRestricoes({ aba: 'ativas', pagina: 1 })).toBe('');
    expect(escreverFiltroRestricoes({ aba: 'resolvidas', pagina: 3 })).toBe(
      'aba=resolvidas&pagina=3',
    );
    expect(RESTRICOES_ROUTE).toBe('/restricoes');
  });
});

describe('restricaoStyles (RN-09)', () => {
  it('mapeia cores do protótipo', () => {
    expect(IMPACTO_COR.atencao).toBe('text-apsen-attention');
    expect(SEVERIDADE_PILL.critica).toContain('bg-apsen-kpi-red');
    expect(prazoCor('critica')).toBe('text-apsen-red');
    expect(prazoCor('analise')).toBe('text-apsen-slate');
  });
});
