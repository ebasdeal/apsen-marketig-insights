import { mockConfigOpcoes, readMockDb } from '@test/fixtures/mockDb';
import { FILTRO_VAZIO } from '../Aprovacao';
import {
  APROV_PAGE_SIZE,
  APROV_STATUS,
  APROV_TIPOS,
  INT_LABEL,
  INT_TONE,
  MOTIVOS_REJEICAO,
  PERMANENTE_FIM,
  STATUS_CFG,
} from '../vocabulario';

const config = readMockDb().config;
const opcoes = mockConfigOpcoes();

function tom(cor: string): string {
  return cor === '' ? '' : cor.slice(6, -1);
}

describe('vocabulário de aprovações × config do db.json', () => {
  it('listas batem com o protótipo', () => {
    expect(APROV_TIPOS).toEqual(opcoes.aprovTipos);
    expect(APROV_STATUS).toEqual(opcoes.aprovStatus);
    expect(MOTIVOS_REJEICAO).toEqual(opcoes.motivosRejeicao);
    expect(INT_LABEL).toEqual(config.INT_LABEL);
    expect(INT_TONE).toEqual((config.INT_COR as string[]).map(tom));
    expect(APROV_PAGE_SIZE).toBe(config.APROV_PER_PAGE);
  });

  it('STATUS_CFG tem os labels e os tons das cores do protótipo', () => {
    const cfg = config.STATUS_CFG as Record<string, { label: string; cor: string }>;
    Object.entries(STATUS_CFG).forEach(([status, { label, tone }]) => {
      expect(label).toBe(cfg[status]?.label);
      expect(tone).toBe(tom(cfg[status]?.cor ?? ''));
    });
  });

  it('constantes de período e filtro', () => {
    expect(PERMANENTE_FIM).toBe('2099-12-31');
    expect(FILTRO_VAZIO).toEqual({ q: '', ini: '', fim: '', tipo: '', status: '' });
  });
});
