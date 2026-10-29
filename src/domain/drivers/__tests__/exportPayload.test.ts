import { CONFIG, makeDriver } from '@test/factories/drivers';
import {
  driverParaExport,
  montarExport,
  nomeArquivoExport,
  TEXTO_EXPORT_VAZIO,
  textoDoExport,
} from '../exportPayload';

const AGORA = new Date('2026-10-27T15:30:00.000Z');

const CHAVES = [
  'id',
  'modo',
  'produto',
  'molecula',
  'codigo',
  'skus_afetados_ia',
  'titulo',
  'periodo',
  'tipo',
  'cobertura',
  'intensidade_esperada',
  'uplift_pct',
  'verba_rs',
  'observacoes',
  'parametros',
];

describe('exportPayload (RN-05, RN-06, CA-05)', () => {
  it('driverParaExport usa snake_case na ordem do protótipo', () => {
    const dto = driverParaExport(makeDriver());
    expect(Object.keys(dto)).toEqual(CHAVES);
    expect(dto).toMatchObject({ id: '3', intensidade_esperada: 3, uplift_pct: 11, verba_rs: null });
  });

  it('montarExport inclui schema, instante, total e instruções', () => {
    const payload = montarExport([makeDriver(), makeDriver({ id: '4' })], CONFIG, AGORA);
    expect(Object.keys(payload)).toEqual([
      'schema',
      'exportado_em',
      'total_registros',
      'instrucoes_modelagem',
      'drivers',
    ]);
    expect(payload).toMatchObject({
      schema: 'drivers-demanda-farma-v2.1',
      exportado_em: '2026-10-27T15:30:00.000Z',
      total_registros: 2,
      instrucoes_modelagem: CONFIG.instrucoesModelagem,
    });
  });

  it('texto indentado com 2 espaços ou "Nenhum registro."', () => {
    const texto = textoDoExport([makeDriver()], CONFIG, AGORA);
    expect(texto).toContain('\n  "schema": "drivers-demanda-farma-v2.1"');
    expect(JSON.parse(texto).drivers).toHaveLength(1);
    expect(textoDoExport([], CONFIG, AGORA)).toBe(TEXTO_EXPORT_VAZIO);
    expect(TEXTO_EXPORT_VAZIO).toBe('Nenhum registro.');
  });

  it('nome do arquivo com a data do export', () => {
    expect(nomeArquivoExport(AGORA)).toBe('drivers_demanda_v2_2026-10-27.json');
  });
});
