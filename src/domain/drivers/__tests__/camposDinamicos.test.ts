import { CAMPOS_PRECO, CATEGORIAS, makeCamposTipo } from '@test/factories/drivers';
import type { CampoTipo } from '../lookups';
import {
  montarParametros,
  moleculaHerdada,
  opcoesDoSelect,
  slugsAtivos,
  tiposDisponiveis,
  valorDaOpcao,
  valoresIniciais,
} from '../camposDinamicos';

const MACRO: CampoTipo = {
  label: 'Tipo específico',
  required: false,
  id: 'd_tipo_macro',
  param: 'tipo_macro',
  type: 'select',
  options: [
    { label: 'Pandemia', group: 'Sanitário' },
    { label: 'Guerra', group: 'Geopolítico' },
    { label: 'Epidemia', group: 'Sanitário' },
  ],
};

describe('valoresIniciais (CA-06)', () => {
  it('select começa na primeira opção e os demais vazios', () => {
    expect(valoresIniciais(makeCamposTipo().campos)).toEqual({
      lab_conc: '',
      conc_nome: '',
      tipo_conc: 'Genérico',
      mol_conc: '',
    });
    expect(valoresIniciais([MACRO])).toEqual({ tipo_macro: 'Pandemia' });
    expect(valorDaOpcao('x')).toBe('x');
  });
});

describe('moleculaHerdada (RN-09)', () => {
  it('usa a família do SKU, a família escolhida ou nada na franquia', () => {
    expect(moleculaHerdada({ modo: 'sku', familia: '', sku: { familia: 'LEVOXIN' } })).toBe(
      'LEVOXIN',
    );
    expect(moleculaHerdada({ modo: 'sku', familia: '', sku: null })).toBeNull();
    expect(moleculaHerdada({ modo: 'familia', familia: 'RETEMIC', sku: null })).toBe('RETEMIC');
    expect(moleculaHerdada({ modo: 'franquia', familia: 'X', sku: null })).toBeNull();
  });
});

describe('montarParametros (RN-08, decisão 7)', () => {
  it('grava todos os campos do tipo com valor, chave = param, com trim', () => {
    expect(
      montarParametros(CAMPOS_PRECO.campos, {
        tipo_preco: 'Reajuste PMVG (CMED)',
        preco_ant: ' 40 ',
        preco_novo: '',
        outro: 'ignorado',
      }),
    ).toEqual({ tipo_preco: 'Reajuste PMVG (CMED)', preco_ant: '40' });
  });

  it('preserva chaves antigas que não são param do tipo, antes das novas', () => {
    const tv: CampoTipo[] = [
      { label: 'GRP', required: false, id: 'd_grp', param: 'grp', type: 'number' },
    ];
    const resultado = montarParametros(
      tv,
      { grp: '400' },
      { emissora: 'Globo', grp: '350', vazio: ' ' },
    );
    expect(resultado).toEqual({ emissora: 'Globo', grp: '400' });
    expect(Object.keys(resultado)).toEqual(['emissora', 'grp']);
  });
});

describe('tiposDisponiveis (RN-07, CA-05)', () => {
  const comercial = CATEGORIAS[1];
  const ativos = slugsAtivos(CATEGORIAS, [
    { slug: 'fv', ativo: false },
    { slug: 'pdv', ativo: true },
  ]);

  it('slug inativo sai e slug ausente em /tipos conta como ativo', () => {
    expect(ativos).toEqual(['tv', 'digital', 'pdv', 'preco', 'concorrente']);
  });

  it('lista só os ativos da categoria, mais o tipo atual', () => {
    expect(tiposDisponiveis(comercial, ativos).map((tipo) => tipo.slug)).toEqual(['pdv', 'preco']);
    expect(tiposDisponiveis(comercial, ativos, 'fv').map((tipo) => tipo.slug)).toEqual([
      'pdv',
      'preco',
      'fv',
    ]);
    expect(tiposDisponiveis(undefined, ativos)).toEqual([]);
  });
});

describe('opcoesDoSelect (CA-06)', () => {
  it('agrupa na ordem de primeira aparição', () => {
    expect(opcoesDoSelect(MACRO)).toEqual({
      soltas: [],
      grupos: [
        { grupo: 'Sanitário', opcoes: ['Pandemia', 'Epidemia'] },
        { grupo: 'Geopolítico', opcoes: ['Guerra'] },
      ],
    });
  });

  it('valor salvo fora das opções entra no fim', () => {
    const campo = makeCamposTipo().campos[2] as CampoTipo;
    expect(opcoesDoSelect(campo, 'Antigo').soltas).toEqual(['Genérico', 'Similar', 'Antigo']);
    expect(opcoesDoSelect(campo, 'Similar').soltas).toEqual(['Genérico', 'Similar']);
    const semOpcoes: CampoTipo = {
      label: 'X',
      required: false,
      id: 'd_x',
      param: 'x',
      type: 'select',
    };
    expect(opcoesDoSelect(semOpcoes).soltas).toEqual([]);
  });
});
