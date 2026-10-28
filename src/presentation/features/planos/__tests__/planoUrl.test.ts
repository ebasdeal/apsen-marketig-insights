import { planoItemRoute, PLANOS_ROUTE } from '../planoRoutes';
import { STATUS_COR, tomDaFamilia } from '../planoStyles';
import { erroDoCampo, mensagemDoCampo } from '../planoErro';
import { PlanoInvalidoError } from '@domain/planos/PlanoErrors';
import { escreverFiltroPlano, lerFiltroPlano, ordemDeTexto, textoDeOrdem } from '../planoUrl';

describe('planoUrl (RN-10)', () => {
  it('valores inválidos caem nos padrões', () => {
    expect(lerFiltroPlano(new URLSearchParams('ordem=xpto&tamanho=7&pagina=0&familia=X'))).toEqual({
      busca: '',
      familia: '',
      status: '',
      ordem: null,
      pagina: 1,
      tamanho: 10,
    });
  });

  it('lê e escreve o filtro completo, omitindo padrões', () => {
    const filtro = lerFiltroPlano(
      new URLSearchParams(
        'busca=bari&familia=Cardio&status=revisao&ordem=qtd-desc&pagina=2&tamanho=25',
      ),
    );
    expect(filtro).toEqual({
      busca: 'bari',
      familia: 'Cardio',
      status: 'revisao',
      ordem: { campo: 'qtd', direcao: 'desc' },
      pagina: 2,
      tamanho: 25,
    });
    expect(escreverFiltroPlano(filtro)).toBe(
      'busca=bari&familia=Cardio&status=revisao&ordem=qtd-desc&pagina=2&tamanho=25',
    );
    expect(
      escreverFiltroPlano({
        ...filtro,
        busca: '',
        familia: '',
        status: '',
        ordem: null,
        pagina: 1,
        tamanho: 10,
      }),
    ).toBe('');
  });

  it('converte a ordem', () => {
    expect(ordemDeTexto('codigo-asc')).toEqual({ campo: 'codigo', direcao: 'asc' });
    expect(ordemDeTexto('nome-asc')).toBeNull();
    expect(ordemDeTexto('codigo-up')).toBeNull();
    expect(textoDeOrdem(null)).toBe('');
  });
});

describe('helpers do plano', () => {
  it('rotas, cores e erros', () => {
    expect(PLANOS_ROUTE).toBe('/planos');
    expect(planoItemRoute('a b')).toBe('/planos/a%20b');
    expect(STATUS_COR.revisao).toBe('text-apsen-orange');
    expect(tomDaFamilia('Imunologia')).toBe('purple');
    expect(tomDaFamilia('Outra')).toBe('slate');
    const erro = erroDoCampo(new PlanoInvalidoError('⚠️ Informe a quantidade.', 'qtd'));
    expect(erro).toEqual({ campo: 'qtd', mensagem: 'Informe a quantidade.' });
    expect(mensagemDoCampo(erro, 'qtd')).toBe('Informe a quantidade.');
    expect(mensagemDoCampo(erro, 'sku')).toBeUndefined();
  });
});
