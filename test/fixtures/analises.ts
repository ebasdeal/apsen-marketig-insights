import type { AnaliseDetailOutput, ListAnalisesOutput } from '@application/analises/dto';
import { toAnaliseDetail } from '@application/analises/GetAnalise';
import { toAnaliseCard } from '@application/analises/ListAnalises';
import type { Analise, NovaAnaliseForm, ResultadoMock, RegraChat } from '@domain/analises/Analise';

export const ANALISE_001_API = {
  id: 'ANL-001',
  codigo: 'ANL-001',
  titulo: 'Impacto campanha TV Inverno — Baricitinibe',
  ciclo: 'PLP-2026-07',
  tipo: 'Impacto de drivers em SKUs específicos',
  skus: ['SKU-00312', 'SKU-00313'],
  modelo: 'SARIMAX',
  status: 'salva',
  criada: '20/06/2026',
  sumario:
    'A análise identificou impacto positivo de <strong>+18% no sell-out</strong> de Baricitinibe para jul/2026.',
  drivers_impacto: [
    { id: 'DRV-2026-034', tipo: '💻 Digital', impacto: 14, dir: 'up', conf: 88 },
    { id: 'DRF-2026-031', tipo: '🚫 ANVISA', impacto: 6, dir: 'up', conf: 92 },
    { id: 'DRV-2026-029', tipo: '⚗️ Falta MP', impacto: -5, dir: 'down', conf: 95 },
  ],
  justificativas: ['Driver de campanha digital tem lag histórico de +1 mês em imunologia.'],
  modelo_info: 'SARIMAX (p=1,d=1,q=1)(P=1,D=1,Q=1,s=12). AIC=847.3, MAPE=8.4%.',
  historico_ia: [],
  salvo_em: '20/06/2026 15:42',
};

export const ANALISE_002_API = {
  id: 'ANL-002',
  codigo: 'ANL-002',
  titulo: 'Comparativo Cardio — Mai vs Jun/2026',
  ciclo: 'PLP-2026-06',
  tipo: 'Comparativo ciclo a ciclo',
  skus: ['SKU-00058', 'SKU-00059', 'SKU-00091'],
  modelo: 'Prophet',
  status: 'relatorio',
  criada: '15/06/2026',
  sumario: 'Apixabana 5mg apresentou crescimento de <strong>+12% ciclo a ciclo</strong>.',
  drivers_impacto: [
    { id: 'DRF-2026-030', tipo: '🆕 Concorrente', impacto: 10, dir: 'up', conf: 85 },
    { id: 'DRV-2026-031', tipo: '🛒 PDV', impacto: 5, dir: 'up', conf: 79 },
  ],
  justificativas: ['Lançamento do genérico gerou buy-in pré-competitivo.'],
  modelo_info: 'Prophet com regressores adicionais. MAPE=6.1%.',
  historico_ia: [
    {
      pergunta: 'Por que Anlodipino não foi afetado?',
      resposta: 'Anlodipino já tem concorrência genérica madura.',
    },
  ],
  salvo_em: '15/06/2026 11:20',
};

export function buildAnalise(overrides: Partial<Analise> = {}): Analise {
  return {
    id: 'ANL-001',
    codigo: 'ANL-001',
    titulo: 'Impacto campanha TV Inverno — Baricitinibe',
    ciclo: 'PLP-2026-07',
    tipo: 'Impacto de drivers em SKUs específicos',
    skus: ['SKU-00312', 'SKU-00313'],
    modelo: 'SARIMAX',
    status: 'salva',
    criada: '20/06/2026',
    comentarios: '',
    drivers: [],
    configModelo: null,
    sumario: 'Impacto de <strong>+18%</strong>.',
    driversImpacto: [
      { id: 'DRV-2026-034', tipo: '💻 Digital', impacto: 14, dir: 'up', conf: 88 },
      { id: 'DRF-2026-031', tipo: '🚫 ANVISA', impacto: 6, dir: 'up', conf: 92 },
      { id: 'DRV-2026-029', tipo: '⚗️ Falta MP', impacto: -5, dir: 'down', conf: 95 },
    ],
    justificativas: ['Driver de campanha digital tem lag histórico de +1 mês em imunologia.'],
    modeloInfo: 'SARIMAX (p=1,d=1,q=1). AIC=847.3, MAPE=8.4%.',
    historicoIa: [],
    salvoEm: '20/06/2026 15:42',
    ...overrides,
  };
}

export const RESULTADO_MOCK: ResultadoMock = {
  modelo: 'Automático → SARIMAX',
  sumario: 'Variação esperada de <strong>+14% no sell-out</strong>.',
  driversImpacto: [{ id: 'DRV-2026-034', tipo: '💻 Digital', impacto: 14, dir: 'up', conf: 88 }],
  justificativas: ['Drivers de mídia têm lag histórico de +1 mês em imunologia.'],
  modeloInfo: 'SARIMAX selecionado automaticamente. AIC=847.3, MAPE=8.4%.',
};

export const REGRAS_CHAT: RegraChat[] = [
  { gatilhos: ['lag', 'defas'], resposta: 'O lag de +1 mês em campanhas digitais…' },
  { gatilhos: ['censur', 'ruptura'], resposta: 'Demanda censurada: ruptura…' },
  { gatilhos: ['mape', 'acurácia'], resposta: 'MAPE de 8.4% = erro médio…' },
  {
    gatilhos: [],
    resposta:
      'Com base nesta análise (ciclo {ciclo}, modelo {modelo}): posso detalhar impacto de qualquer driver.',
  },
];

export function buildNovaAnaliseForm(overrides: Partial<NovaAnaliseForm> = {}): NovaAnaliseForm {
  return {
    titulo: 'Teste Cardio',
    ciclo: 'PLP-2026-07',
    tipo: 'Impacto de drivers em SKUs específicos',
    comentarios: '',
    skus: ['SKU-00058'],
    drivers: ['DRV-2026-032'],
    configModelo: { modo: 'auto' },
    horizonteTexto: '3',
    ...overrides,
  };
}

export function buildAnaliseDetail(overrides: Partial<Analise> = {}): AnaliseDetailOutput {
  return toAnaliseDetail(buildAnalise(overrides));
}

export function buildListAnalisesOutput(
  analises: Analise[] = [buildAnalise()],
): ListAnalisesOutput {
  return { itens: analises.map(toAnaliseCard), total: analises.length, pagina: 1, tamanho: 10 };
}
