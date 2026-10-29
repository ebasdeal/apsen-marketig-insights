import { makeCamposTipo, makeDraft, makeSku } from '@test/factories/drivers';
import { codigoSku, montarDriver } from '../montarDriver';

const CAMPOS = makeCamposTipo().campos;

describe('codigoSku (RN-02, decisão 6)', () => {
  it('usa o número entre parênteses no fim ou o nome inteiro', () => {
    expect(codigoSku('LEVOXIN 500MG - 7 COMP. (2300)')).toBe('2300');
    expect(codigoSku('ENIAGOR SEC 50MG/ML REFIL ')).toBe('ENIAGOR SEC 50MG/ML REFIL');
    expect(codigoSku('X (SKU-1)')).toBe('X (SKU-1)');
  });
});

describe('montarDriver (RN-02, RN-06, RN-08)', () => {
  it('modo SKU grava nome, família e código do SKU', () => {
    const driver = montarDriver(
      makeDraft({ titulo: ' Campanha ', observacoes: ' obs ', uplift: '15', verba: '250000' }),
      { campos: CAMPOS },
      'uuid-1',
    );
    expect(driver).toEqual({
      id: 'uuid-1',
      modo: 'sku',
      produto: 'LEVOXIN 500MG - 7 COMP. (2300)',
      molecula: 'LEVOXIN',
      codigo: '2300',
      skusAfetadosIa: [],
      titulo: 'Campanha',
      periodo: { inicio: '2026-07-01', fim: '2026-08-31' },
      tipo: 'concorrente',
      cobertura: { regioes: ['nacional'], canais: ['farmacias'] },
      intensidadeEsperada: 1,
      upliftPct: 15,
      verbaRs: 250000,
      observacoes: 'obs',
      parametros: { lab_conc: 'EMS', tipo_conc: 'Genérico', mol_conc: 'LEVOXIN' },
    });
  });

  it('modo Família grava só o nível; os SKUs são resolvidos pelo pipeline na ingestão (DRV-15)', () => {
    const driver = montarDriver(
      makeDraft({ modo: 'familia', sku: null, familia: 'LEVOXIN', uplift: '', verba: 'abc' }),
      { campos: CAMPOS },
      'uuid-2',
    );
    expect(driver).toMatchObject({
      produto: 'LEVOXIN (Família)',
      molecula: 'LEVOXIN',
      codigo: '',
      skusAfetadosIa: [],
      upliftPct: null,
      verbaRs: null,
    });
  });

  it('modo Franquia grava só o nível, sem lista de SKUs (DRV-15)', () => {
    const driver = montarDriver(
      makeDraft({ modo: 'franquia', sku: null, franquia: 'ASTER' }),
      { campos: CAMPOS },
      'uuid-3',
    );
    expect(driver).toMatchObject({
      produto: 'ASTER (Franquia)',
      molecula: 'ASTER',
      codigo: '',
      skusAfetadosIa: [],
    });
  });

  it('SKU ausente gera produto vazio e preserva chaves antigas', () => {
    const driver = montarDriver(
      makeDraft({ sku: null }),
      { campos: CAMPOS, preservar: { emissora: 'Globo' } },
      'x',
    );
    expect(driver).toMatchObject({ produto: '', molecula: '', codigo: '' });
    expect(Object.keys(driver.parametros)[0]).toBe('emissora');
  });

  it('modo SKU não preenche skusAfetadosIa (RN-06)', () => {
    const driver = montarDriver(makeDraft({ sku: makeSku() }), { campos: CAMPOS }, 'x');
    expect(driver.skusAfetadosIa).toEqual([]);
  });

  it('Data Fim em branco vira 1 ano após a data início (DRV-01)', () => {
    const driver = montarDriver(
      makeDraft({ inicio: '2026-07-01', fim: '' }),
      { campos: CAMPOS },
      'x',
    );
    expect(driver.periodo).toEqual({ inicio: '2026-07-01', fim: '2027-07-01' });
  });

  it('Data Fim informada é mantida', () => {
    const driver = montarDriver(
      makeDraft({ inicio: '2026-07-01', fim: '2026-09-30' }),
      { campos: CAMPOS },
      'x',
    );
    expect(driver.periodo.fim).toBe('2026-09-30');
  });
});
