import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { HttpAnaliseApoioRepository } from '../HttpAnaliseApoioRepository';

const BASE = 'http://localhost:3001';

const MOCK_RESULTADO = {
  modelo: 'Automático → SARIMAX',
  status: 'rascunho',
  sumario: 'Variação de <strong>+14%</strong>.',
  drivers_impacto: [{ id: 'DRV-2026-034', tipo: '💻 Digital', impacto: 14, dir: 'up', conf: 88 }],
  justificativas: ['Lag de +1 mês.'],
  modelo_info: 'SARIMAX selecionado automaticamente.',
};

const CHAT = [
  { gatilhos: ['lag'], resposta: 'O lag…' },
  { gatilhos: [], resposta: 'Padrão {ciclo} {modelo}' },
];

function setup(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const http = new FetchHttpClient({ baseUrl: BASE, fetchFn });
  return {
    apoio: new HttpAnaliseApoioRepository(http),
    calls,
  };
}

describe('HttpAnaliseApoioRepository', () => {
  it('skusDoCiclo lê /skusCiclo/{ciclo}; dias ausente vira 0', async () => {
    const { apoio, calls } = setup({
      '/skusCiclo/PLP-2026-07': {
        body: {
          id: 'PLP-2026-07',
          skus: [
            { codigo: 'SKU-00312', nome: 'Baricitinibe 2mg', familia: 'Imunologia', dias: 18 },
            { codigo: 'SKU-00999', nome: 'Sem estoque', familia: 'Cardio' },
          ],
        },
      },
    });
    await expect(apoio.skusDoCiclo('PLP-2026-07')).resolves.toEqual([
      { codigo: 'SKU-00312', nome: 'Baricitinibe 2mg', familia: 'Imunologia', dias: 18 },
      { codigo: 'SKU-00999', nome: 'Sem estoque', familia: 'Cardio', dias: 0 },
    ]);
    expect(calls[0]?.url).toBe(`${BASE}/skusCiclo/PLP-2026-07`);
  });

  it('skusDoCiclo: 404 → lista vazia; 500 propaga; fora do contrato → InvalidResponseError', async () => {
    const { apoio } = setup({
      '/skusCiclo/ERRO': { status: 500, body: {} },
      '/skusCiclo/RUIM': { body: { id: 'RUIM' } },
    });
    await expect(apoio.skusDoCiclo('PLP-1999-01')).resolves.toEqual([]);
    await expect(apoio.skusDoCiclo('ERRO')).rejects.toBeInstanceOf(HttpError);
    await expect(apoio.skusDoCiclo('RUIM')).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('modelosGuiados lê /modelosGuiados', async () => {
    const modelo = { id: 'sarimax', nome: 'SARIMAX', icon: '📊', desc: 'd', tag: 'Recomendado' };
    const { apoio } = setup({ '/modelosGuiados': { body: [modelo] } });
    await expect(apoio.modelosGuiados()).resolves.toEqual([modelo]);
  });

  it('configuracao lê só analiseMockResultado e chatRespostas de /config', async () => {
    const { apoio } = setup({
      '/config': {
        body: { id: 1, crumbMap: {}, analiseMockResultado: MOCK_RESULTADO, chatRespostas: CHAT },
      },
    });
    await expect(apoio.configuracao()).resolves.toEqual({
      resultado: {
        modelo: 'Automático → SARIMAX',
        sumario: 'Variação de <strong>+14%</strong>.',
        driversImpacto: MOCK_RESULTADO.drivers_impacto,
        justificativas: ['Lag de +1 mês.'],
        modeloInfo: 'SARIMAX selecionado automaticamente.',
      },
      regrasChat: CHAT,
    });
  });

  it('config sem regra padrão ou sem chatRespostas → InvalidResponseError', async () => {
    const semPadrao = setup({
      '/config': {
        body: { analiseMockResultado: MOCK_RESULTADO, chatRespostas: [CHAT[0]] },
      },
    });
    await expect(semPadrao.apoio.configuracao()).rejects.toThrow('sem regra padrão');
    const vazio = setup({
      '/config': { body: { analiseMockResultado: MOCK_RESULTADO, chatRespostas: [] } },
    });
    await expect(vazio.apoio.configuracao()).rejects.toBeInstanceOf(InvalidResponseError);
    const raiz = setup({ '/config': { body: [] } });
    await expect(raiz.apoio.configuracao()).rejects.toThrow('(raiz)');
  });
});
