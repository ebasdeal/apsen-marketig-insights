import { InvalidEnvError, parseEnv, readProcessEnv } from '../env';

describe('parseEnv', () => {
  it('usa mock com latência padrão quando nada é informado', () => {
    expect(parseEnv({})).toEqual({ apiUrl: undefined, mockLatencyMs: 600 });
  });

  it('trata strings vazias como ausentes', () => {
    expect(parseEnv({ NEXT_PUBLIC_API_URL: '  ', NEXT_PUBLIC_MOCK_LATENCY_MS: '' })).toEqual({
      apiUrl: undefined,
      mockLatencyMs: 600,
    });
  });

  it('normaliza URL e converte latência', () => {
    expect(
      parseEnv({
        NEXT_PUBLIC_API_URL: ' https://api.exemplo.com/v1/ ',
        NEXT_PUBLIC_MOCK_LATENCY_MS: '0',
      }),
    ).toEqual({ apiUrl: 'https://api.exemplo.com/v1', mockLatencyMs: 0 });
  });

  it.each([
    [{ NEXT_PUBLIC_API_URL: 'nao-e-url' }, 'NEXT_PUBLIC_API_URL'],
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: 'abc' }, 'NEXT_PUBLIC_MOCK_LATENCY_MS'],
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: '-5' }, 'NEXT_PUBLIC_MOCK_LATENCY_MS'],
    [{ NEXT_PUBLIC_MOCK_LATENCY_MS: '20000' }, 'NEXT_PUBLIC_MOCK_LATENCY_MS'],
  ])('rejeita configuração inválida %p', (source, key) => {
    expect(() => parseEnv(source)).toThrow(InvalidEnvError);
    expect(() => parseEnv(source)).toThrow(key);
  });
});

describe('readProcessEnv', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('lê apenas as variáveis públicas usadas pelo app', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.exemplo.com';
    process.env.NEXT_PUBLIC_MOCK_LATENCY_MS = '10';
    expect(readProcessEnv()).toEqual({
      NEXT_PUBLIC_API_URL: 'https://api.exemplo.com',
      NEXT_PUBLIC_MOCK_LATENCY_MS: '10',
    });
  });
});
