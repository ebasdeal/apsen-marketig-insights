import type {
  DriverFormLookupsDto,
  DriverListItemDto,
  DriversExportDto,
  DriversPageDto,
} from '@application/drivers/dto';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverDraft } from '@domain/drivers/draft';
import type { CamposTipo, Categoria, DriverConfig, IntensidadeInfo } from '@domain/drivers/lookups';
import { makeFamilia, makeFranquia, makeSku } from './catalogo';

export { makeFamilia, makeSku };

export const INTENSIDADES: IntensidadeInfo[] = [
  {
    id: 1,
    label: 'Marginal',
    faixa: '+1% a +3%',
    default: 2,
    desc: 'Efeito quase imperceptível — ação pontual ou local.',
  },
  {
    id: 2,
    label: 'Baixo',
    faixa: '+3% a +8%',
    default: 5,
    desc: 'Leve movimento esperado acima do normal.',
  },
  {
    id: 3,
    label: 'Moderado',
    faixa: '+8% a +15%',
    default: 12,
    desc: 'Efeito claro, mas dentro da variação típica.',
  },
  {
    id: 4,
    label: 'Alto',
    faixa: '+15% a +30%',
    default: 22,
    desc: 'Campanha ou evento forte — desvio relevante do baseline.',
  },
  {
    id: 5,
    label: 'Muito alto',
    faixa: '+30% ou mais',
    default: 40,
    desc: 'Evento excepcional (lançamento nacional, ruptura, pico sazonal).',
  },
];

export const CATEGORIAS: Categoria[] = [
  {
    id: 0,
    label: '📡 Mídia & Comunicação',
    slug: 'midia',
    tipos: [
      { slug: 'tv', label: '📺 TV Aberta' },
      { slug: 'digital', label: '💻 Digital / Redes' },
    ],
  },
  {
    id: 1,
    label: '🛒 Comercial & Campo',
    slug: 'comercial',
    tipos: [
      { slug: 'pdv', label: '🛒 Ação PDV / Trade' },
      { slug: 'preco', label: '💲 Mudança de Preço' },
      { slug: 'fv', label: '👥 Força de Vendas' },
    ],
  },
  {
    id: 5,
    label: '🏁 Concorrência',
    slug: 'concorrencia',
    tipos: [{ slug: 'concorrente', label: '🏁 Ação de Concorrente' }],
  },
];

export const CONFIG: DriverConfig = {
  labels: {
    tv: '📺 TV Aberta',
    digital: '💻 Digital',
    pdv: '🛒 PDV/Trade',
    preco: '💲 Preço',
    concorrente: '🏁 Concorrente',
  },
  regioes: [
    { value: 'nacional', label: '🇧🇷 Nacional' },
    { value: 'sudeste', label: 'Sudeste' },
    { value: 'sul', label: 'Sul' },
  ],
  canais: [
    { value: 'farmacias', label: '💊 Farmácias' },
    { value: 'hospitalar', label: '🏥 Hospitalar' },
  ],
  canaisDefault: ['farmacias'],
  exportSchema: 'drivers-demanda-farma-v2.1',
  instrucoesModelagem: ['Cada driver → variável exógena.', 'Correlação ≠ causa.'],
};

export function makeCamposTipo(overrides: Partial<CamposTipo> = {}): CamposTipo {
  return {
    id: 'concorrente',
    title: '🏁 Ação de Concorrente',
    layout: 'g3',
    campos: [
      {
        label: 'Laboratório',
        required: true,
        id: 'd_lab_conc',
        param: 'lab_conc',
        type: 'autocomplete',
        autocomplete: 'labs',
        placeholder: 'Digite para buscar o laboratório...',
      },
      {
        label: 'Nome do concorrente / marca',
        required: false,
        id: 'd_conc_nome',
        param: 'conc_nome',
        type: 'autocomplete',
        autocomplete: 'marcas',
      },
      {
        label: 'Tipo',
        required: false,
        id: 'd_tipo_conc',
        param: 'tipo_conc',
        type: 'select',
        options: ['Genérico', 'Similar'],
      },
      {
        label: 'Molécula / dosagem',
        required: false,
        labelHint: '(do concorrente)',
        id: 'd_mol_conc',
        param: 'mol_conc',
        type: 'text',
      },
    ],
    ...overrides,
  };
}

export const CAMPOS_PRECO: CamposTipo = {
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
      label: 'Preço anterior',
      required: false,
      id: 'd_preco_ant',
      param: 'preco_ant',
      type: 'number',
      step: '0.01',
    },
    {
      label: 'Preço novo',
      required: false,
      id: 'd_preco_novo',
      param: 'preco_novo',
      type: 'number',
      step: '0.01',
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
};

export function makeDriver(overrides: Partial<Driver> = {}): Driver {
  return {
    id: '3',
    modo: 'sku',
    produto: 'LEVOXIN 500MG - 7 COMP. (2300)',
    molecula: 'LEVOXIN',
    codigo: '2300',
    skusAfetadosIa: [],
    titulo: 'Ajuste de preço Levoxin 500mg Jul/2026',
    periodo: { inicio: '2026-07-15', fim: '2027-01-15' },
    tipo: 'preco',
    cobertura: { regioes: ['sudeste', 'sul'], canais: ['farmacias'] },
    intensidadeEsperada: 3,
    upliftPct: 11,
    verbaRs: null,
    observacoes: 'Reajuste CMED aplicado à apresentação de 7 comprimidos.',
    parametros: { preco_novo: '42.90', variacao_pct: '6.5' },
    ...overrides,
  };
}

export function makeDraft(overrides: Partial<DriverDraft> = {}): DriverDraft {
  return {
    modo: 'sku',
    franquia: '',
    familia: '',
    sku: makeSku(),
    titulo: 'Campanha Inverno',
    inicio: '2026-07-01',
    fim: '2026-08-31',
    categoriaId: 5,
    tipo: 'concorrente',
    parametros: { lab_conc: 'EMS', conc_nome: '', tipo_conc: 'Genérico', mol_conc: 'LEVOXIN' },
    herdado: 'LEVOXIN',
    regioes: ['nacional'],
    canais: ['farmacias'],
    intensidade: 1,
    uplift: '2',
    upliftManual: false,
    verba: '',
    observacoes: '',
    ...overrides,
  };
}

export function makeLookups(overrides: Partial<DriverFormLookupsDto> = {}): DriverFormLookupsDto {
  return {
    categorias: CATEGORIAS,
    tiposAtivos: ['tv', 'digital', 'pdv', 'preco', 'concorrente'],
    donoPorTipo: { tv: 'Marketing', digital: 'Marketing', pdv: 'Comercial' },
    camposPorTipo: { concorrente: makeCamposTipo(), preco: CAMPOS_PRECO },
    intensidades: INTENSIDADES,
    config: CONFIG,
    franquias: [makeFranquia()],
    ...overrides,
  };
}

export function makeDriverListItem(overrides: Partial<DriverListItemDto> = {}): DriverListItemDto {
  return {
    id: '1',
    badge: { label: '💻 Digital', tone: 'tv' },
    titulo: 'Baricitinibe 2mg (SKU-00312) — Campanha Instagram Jul/2026',
    periodo: '2026-07-01 → 2026-07-31',
    estrelas: '★★★★☆',
    verba: 250000,
    canais: ['farmacias'],
    parametros: [
      { chave: 'plataforma', valor: 'Instagram' },
      { chave: 'formato', valor: 'Reels' },
      { chave: 'impressoes', valor: '2400000' },
    ],
    observacoes: 'Teste de registro',
    ...overrides,
  };
}

export function makeDriversPage(overrides: Partial<DriversPageDto> = {}): DriversPageDto {
  return { items: [makeDriverListItem()], total: 1, page: 1, size: 10, ...overrides };
}

export function makeDriversExport(overrides: Partial<DriversExportDto> = {}): DriversExportDto {
  return {
    texto: '{}',
    nomeArquivo: 'drivers_demanda_v2_2026-10-27.json',
    total: 1,
    ...overrides,
  };
}
