export const DRIVER_API_3 = {
  id: 3,
  modo: 'sku',
  produto: 'LEVOXIN 500MG - 7 COMP. (2300)',
  molecula: 'LEVOXIN',
  codigo: '2300',
  skus_afetados_ia: [],
  titulo: 'Ajuste de preço Levoxin 500mg Jul/2026',
  periodo: { inicio: '2026-07-15', fim: '2027-01-15' },
  tipo: 'preco',
  cobertura: { regioes: ['sudeste', 'sul'], canais: ['farmacias'] },
  intensidade_esperada: 3,
  uplift_pct: 11,
  verba_rs: null,
  observacoes: 'Reajuste CMED aplicado à apresentação de 7 comprimidos.',
  parametros: { preco_novo: '42.90', variacao_pct: 6.5 },
};

export const CONFIG_API = {
  id: 'config',
  LABEL: { tv: '📺 TV Aberta', preco: '💲 Preço' },
  opcoes: {
    regioes: [{ value: 'nacional', label: '🇧🇷 Nacional' }],
    canais: [{ value: 'farmacias', label: '💊 Farmácias' }],
    canaisDefault: ['farmacias'],
    outros: [],
  },
  exportSchema: 'drivers-demanda-farma-v2.1',
  instrucoes_modelagem: ['a', 'b'],
  SCREEN_ROLES: {},
};

export const CAMPOS_TIPO_API = [
  {
    id: 'preco',
    title: '💲 Mudança de Preço',
    layout: 'g3',
    campos: [
      {
        label: 'Tipo',
        required: false,
        id: 'd_tipo_preco',
        param: 'tipo_preco',
        type: 'select',
        options: ['Reajuste preço fábrica', 'Reajuste PMVG (CMED)'],
      },
      {
        label: 'Variação (%)',
        required: false,
        id: 'd_var_preco',
        param: 'var_preco',
        type: 'number',
        placeholder: 'Auto',
        step: '0.01',
        readonly: true,
      },
    ],
  },
];

export const INTENSIDADES_API = [1, 2, 3, 4, 5].map((id) => ({
  id,
  label: `L${id}`,
  faixa: `F${id}`,
  default: id * 2,
  desc: `D${id}`,
}));
