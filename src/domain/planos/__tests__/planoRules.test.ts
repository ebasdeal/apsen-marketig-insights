import {
  LINHAS,
  PLANO_FAMILIAS,
  PLANO_SKUS_INCLUSAO,
  PLANO_STATUS,
  PLANO_STATUS_LABEL,
  RESPONSAVEIS_PLANO,
  SEMANAS,
  TAMANHO_PADRAO,
  TAMANHOS_PAGINA,
} from '../planoConstants';
import { PlanoInvalidoError, PlanoSemCicloError } from '../PlanoErrors';
import type { InclusaoForm, PlanoItem } from '../PlanoItem';
import {
  alteracoesDoItem,
  alternarOrdem,
  formularioAlterado,
  formularioDoItem,
  formularioInclusaoVazio,
  novoItem,
  padraoDoPrefixo,
  podeEditar,
  prefixoDoCiclo,
  proximoCodigoPlano,
  quantidadeValida,
  skuSemPrefixo,
  validarEdicao,
  validarInclusao,
} from '../planoRules';

const ITEM: PlanoItem = {
  id: 'PLP-2026-07-005',
  codigo: 'PLP-2026-07-005',
  sku: 'SKU-00313',
  nome: 'Baricitinibe 4mg',
  apres: 'Blister 28cp',
  familia: 'Imunologia',
  qtd: 31500,
  linha: 'Linha 2',
  semana: 'S28 (07–13/07)',
  status: 'pendente',
  resp: 'Carlos Lima',
  obs: '',
};

function inclusao(overrides: Partial<InclusaoForm> = {}): InclusaoForm {
  return { ...formularioInclusaoVazio(), ...overrides };
}

function erroDe(fn: () => unknown): PlanoInvalidoError {
  try {
    fn();
  } catch (error) {
    if (error instanceof PlanoInvalidoError) {
      return error;
    }
  }
  throw new Error('esperava PlanoInvalidoError');
}

describe('constantes do plano', () => {
  it('seguem o protótipo', () => {
    expect(PLANO_STATUS).toEqual(['aprovado', 'revisao', 'bloqueado', 'pendente']);
    expect(PLANO_STATUS_LABEL.revisao).toBe('Em Revisão');
    expect(PLANO_FAMILIAS).toHaveLength(7);
    expect(LINHAS).toHaveLength(4);
    expect(SEMANAS[0]).toBe('S27 (30/06–06/07)');
    expect(RESPONSAVEIS_PLANO).toEqual(['Ana Planejadora', 'Carlos Lima', 'Roberto Gerente']);
    expect(PLANO_SKUS_INCLUSAO).toHaveLength(10);
    expect(TAMANHOS_PAGINA).toEqual([10, 25, 50]);
    expect(TAMANHO_PADRAO).toBe(10);
  });
});

describe('alternarOrdem (RN-02)', () => {
  it('primeiro clique asc, mesmo campo inverte, outro campo recomeça asc', () => {
    const asc = alternarOrdem(null, 'codigo');
    expect(asc).toEqual({ campo: 'codigo', direcao: 'asc' });
    const desc = alternarOrdem(asc, 'codigo');
    expect(desc).toEqual({ campo: 'codigo', direcao: 'desc' });
    expect(alternarOrdem(desc, 'codigo')).toEqual({ campo: 'codigo', direcao: 'asc' });
    expect(alternarOrdem(desc, 'qtd')).toEqual({ campo: 'qtd', direcao: 'asc' });
  });
});

describe('códigos (RN-05)', () => {
  it('proximoCodigoPlano soma 1 ao maior sufixo do prefixo', () => {
    expect(proximoCodigoPlano('PLP-2026-07', 'PLP-2026-07-247')).toBe('PLP-2026-07-248');
    expect(proximoCodigoPlano('PLP-2026-08', null)).toBe('PLP-2026-08-001');
    expect(proximoCodigoPlano('PLP-2026-08', 'PLP-2026-07-247')).toBe('PLP-2026-08-001');
  });

  it('prefixoDoCiclo usa o ciclo ativo ou o prefixo do maior código', () => {
    expect(prefixoDoCiclo('PLP-2026-07', 'PLP-2026-06-010')).toBe('PLP-2026-07');
    expect(prefixoDoCiclo(null, 'PLP-2026-07-010')).toBe('PLP-2026-07');
  });

  it('sem ciclo e sem código válido lança PlanoSemCicloError', () => {
    expect(() => prefixoDoCiclo(null, null)).toThrow(PlanoSemCicloError);
    expect(() => prefixoDoCiclo(null, 'SEMHIFEN')).toThrow(
      '⚠️ Nenhum ciclo ativo para gerar o código.',
    );
  });

  it('padraoDoPrefixo escapa caracteres de regex', () => {
    expect(padraoDoPrefixo('PLP-2026-07')).toBe('^PLP-2026-07-');
    expect(padraoDoPrefixo('A.B')).toBe('^A\\.B-');
  });
});

describe('edição e quantidade (RN-03, RN-04, RN-06)', () => {
  it('podeEditar só fora de aprovado', () => {
    expect(podeEditar(ITEM)).toBe(true);
    expect(podeEditar({ status: 'aprovado' })).toBe(false);
  });

  it('quantidadeValida aceita só inteiro > 0', () => {
    expect(quantidadeValida(' 50000 ')).toBe(50000);
    expect(quantidadeValida('0')).toBeNull();
    expect(quantidadeValida('')).toBeNull();
    expect(quantidadeValida('1.5')).toBeNull();
    expect(quantidadeValida('-3')).toBeNull();
    expect(quantidadeValida('99999999999999999999')).toBeNull();
  });

  it('validarInclusao acusa SKU antes da quantidade', () => {
    const semSku = erroDe(() => validarInclusao(inclusao()));
    expect(semSku.message).toBe('⚠️ Selecione o SKU.');
    expect(semSku.campo).toBe('sku');
    const semQtd = erroDe(() => validarInclusao(inclusao({ sku: 'SKU-00312' })));
    expect(semQtd.message).toBe('⚠️ Informe a quantidade.');
    expect(semQtd.campo).toBe('qtd');
    expect(validarInclusao(inclusao({ sku: 'SKU-00312', qtd: '10' }))).toBe(10);
  });

  it('validarEdicao exige quantidade', () => {
    expect(erroDe(() => validarEdicao({ ...formularioDoItem(ITEM), qtd: '0' })).campo).toBe('qtd');
    expect(validarEdicao(formularioDoItem(ITEM))).toBe(31500);
  });
});

describe('montagem', () => {
  it('novoItem é pendente e usa os dados do SkuMeta', () => {
    const meta = {
      id: 'SKU-00058',
      nome: 'Apixabana 5mg',
      apres: 'Blister 60cp',
      familia: 'Cardio',
    };
    const item = novoItem(
      inclusao({ sku: 'SKU-00058', qtd: '50000', linha: 'Linha 2', obs: ' Previsão ' }),
      meta,
      'uuid-1',
      'PLP-2026-07-248',
    );
    expect(item).toEqual({
      id: 'uuid-1',
      codigo: 'PLP-2026-07-248',
      sku: 'SKU-00058',
      nome: 'Apixabana 5mg',
      apres: 'Blister 60cp',
      familia: 'Cardio',
      qtd: 50000,
      linha: 'Linha 2',
      semana: 'S27 (30/06–06/07)',
      status: 'pendente',
      resp: 'Ana Planejadora',
      obs: 'Previsão',
    });
  });

  it('alteracoesDoItem grava só os campos editáveis', () => {
    expect(
      alteracoesDoItem({ ...formularioDoItem(ITEM), qtd: '40000', status: 'revisao' }),
    ).toEqual({
      qtd: 40000,
      linha: 'Linha 2',
      semana: 'S28 (07–13/07)',
      status: 'revisao',
      resp: 'Carlos Lima',
      obs: '',
    });
  });

  it('skuSemPrefixo remove SKU-', () => {
    expect(skuSemPrefixo('SKU-00312')).toBe('00312');
    expect(skuSemPrefixo('X-1')).toBe('X-1');
  });
});

describe('formulários', () => {
  it('inclusão vazia com Linha 1, S27 e Ana Planejadora', () => {
    expect(formularioInclusaoVazio()).toEqual({
      sku: '',
      qtd: '',
      linha: 'Linha 1',
      semana: 'S27 (30/06–06/07)',
      resp: 'Ana Planejadora',
      obs: '',
    });
  });

  it('formularioDoItem e formularioAlterado', () => {
    const original = formularioDoItem(ITEM);
    expect(original.qtd).toBe('31500');
    expect(formularioAlterado(original, { ...original })).toBe(false);
    expect(formularioAlterado(original, { ...original, obs: 'x' })).toBe(true);
  });
});
