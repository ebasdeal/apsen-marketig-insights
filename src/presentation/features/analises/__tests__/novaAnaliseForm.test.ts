import {
  configModeloDe,
  erroDoCampo,
  ESTADO_INICIAL,
  formDe,
  novaAnaliseReducer,
  type NovaAnaliseAction,
} from '../novaAnaliseForm';

function aplicar(...actions: NovaAnaliseAction[]) {
  return actions.reduce(novaAnaliseReducer, ESTADO_INICIAL);
}

describe('novaAnaliseForm', () => {
  it('estado inicial: modo automático, SARIMAX, horizonte 3, parâmetros 1, checks marcados', () => {
    expect(ESTADO_INICIAL).toMatchObject({
      modo: 'auto',
      modeloGuiado: 'sarimax',
      horizonte: '3',
      tipo: 'Impacto de drivers em SKUs específicos',
      dirty: false,
    });
    expect(Object.values(ESTADO_INICIAL.sarimax)).toEqual(['1', '1', '1', '1', '1', '1', '1']);
    expect(Object.values(ESTADO_INICIAL.sazonalidades).every(Boolean)).toBe(true);
  });

  it('trocar o ciclo limpa os SKUs; marcar/desmarcar SKUs e drivers', () => {
    const estado = aplicar(
      { type: 'sku', codigo: 'A', marcado: true },
      { type: 'sku', codigo: 'B', marcado: true },
      { type: 'sku', codigo: 'A', marcado: false },
      { type: 'driver', id: 'D1', marcado: false },
    );
    expect(estado.skus).toEqual(['B']);
    expect(estado.driversDesmarcados).toEqual(['D1']);
    expect(estado.dirty).toBe(true);
    expect(
      aplicar({ type: 'skus', codigos: ['A', 'B'] }, { type: 'ciclo', valor: 'X' }).skus,
    ).toEqual([]);
    expect(formDe(estado, ['D1', 'D2']).drivers).toEqual(['D2']);
  });

  it('configModelo por modo e modelo avançado', () => {
    expect(configModeloDe(ESTADO_INICIAL)).toEqual({ modo: 'auto' });
    expect(
      configModeloDe(
        aplicar(
          { type: 'modo', valor: 'guiado' },
          { type: 'campo', campo: 'modeloGuiado', valor: 'prophet' },
        ),
      ),
    ).toEqual({ modo: 'guiado', modelo: 'prophet' });
    const avancado = aplicar(
      { type: 'modo', valor: 'avancado' },
      { type: 'sarimax', param: 'p', valor: '2' },
    );
    expect(configModeloDe(avancado)).toMatchObject({
      modo: 'avancado',
      modelo: 'sarimax',
      parametros: { p: 2, s: 1 },
    });
    const prophet = aplicar(
      { type: 'modo', valor: 'avancado' },
      { type: 'campo', campo: 'modeloAvancado', valor: 'prophet' },
      { type: 'sazonalidade', nome: 'Semanal', marcado: false },
    );
    expect(configModeloDe(prophet).parametros).toMatchObject({ Anual: true, Semanal: false });
    const ensemble = aplicar(
      { type: 'modo', valor: 'avancado' },
      { type: 'campo', campo: 'modeloAvancado', valor: 'ensemble' },
      { type: 'ensemble', nome: 'Prophet', marcado: false },
    );
    expect(configModeloDe(ensemble).parametros).toMatchObject({ SARIMAX: true, Prophet: false });
    const holt = aplicar(
      { type: 'modo', valor: 'avancado' },
      { type: 'campo', campo: 'modeloAvancado', valor: 'holt_winters' },
    );
    expect(configModeloDe(holt)).toEqual({ modo: 'avancado', modelo: 'holt_winters' });
  });

  it('erroDoCampo remove o ⚠️ do toast', () => {
    expect(erroDoCampo('⚠️ Informe o título.')).toBe('Informe o título.');
  });
});
