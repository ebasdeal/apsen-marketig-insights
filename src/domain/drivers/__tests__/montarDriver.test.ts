import { LEVOXIN_SKUS } from '@test/factories/catalogo';
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
      { campos: CAMPOS, skus: [] },
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

  it('modo Família usa os códigos dos SKUs da família', () => {
    const driver = montarDriver(
      makeDraft({ modo: 'familia', sku: null, familia: 'LEVOXIN', uplift: '', verba: 'abc' }),
      { campos: CAMPOS, skus: LEVOXIN_SKUS },
      'uuid-2',
    );
    expect(driver).toMatchObject({
      produto: 'LEVOXIN (Família)',
      molecula: 'LEVOXIN',
      codigo: '',
      skusAfetadosIa: ['2298', '2299', '2300'],
      upliftPct: null,
      verbaRs: null,
    });
  });

  it('modo Franquia agrega os SKUs na ordem recebida; SKU sem código vira o nome', () => {
    const driver = montarDriver(
      makeDraft({ modo: 'franquia', sku: null, franquia: 'ASTER' }),
      { campos: CAMPOS, skus: ['ENIAGOR SEC 50MG/ML REFIL', 'LEVOXIN 500MG (2300)'] },
      'uuid-3',
    );
    expect(driver).toMatchObject({
      produto: 'ASTER (Franquia)',
      molecula: 'ASTER',
      codigo: '',
      skusAfetadosIa: ['ENIAGOR SEC 50MG/ML REFIL', '2300'],
    });
  });

  it('SKU ausente gera produto vazio e preserva chaves antigas', () => {
    const driver = montarDriver(
      makeDraft({ sku: null }),
      { campos: CAMPOS, skus: [], preservar: { emissora: 'Globo' } },
      'x',
    );
    expect(driver).toMatchObject({ produto: '', molecula: '', codigo: '' });
    expect(Object.keys(driver.parametros)[0]).toBe('emissora');
  });

  it('não usa moleculaSkus (RN-06): SKU escolhido não preenche skusAfetadosIa', () => {
    const driver = montarDriver(
      makeDraft({ sku: makeSku() }),
      { campos: CAMPOS, skus: LEVOXIN_SKUS },
      'x',
    );
    expect(driver.skusAfetadosIa).toEqual([]);
  });
});
