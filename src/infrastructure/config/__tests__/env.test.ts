import { DEFAULT_API_URL, InvalidEnvError, parseEnv, parseLoginEnv, readProcessEnv } from '../env';

describe('parseEnv', () => {
  it('aponta para a API local e usa login simulado quando nada é informado', () => {
    expect(parseEnv({})).toEqual({
      apiUrl: DEFAULT_API_URL,
      authMode: 'simulado',
    });
    expect(DEFAULT_API_URL).toBe('http://localhost:3001');
  });

  it('trata strings vazias como ausentes', () => {
    expect(parseEnv({ NEXT_PUBLIC_API_URL: '  ', NEXT_PUBLIC_AUTH_MODE: ' ' })).toEqual({
      apiUrl: DEFAULT_API_URL,
      authMode: 'simulado',
    });
  });

  it('lê ambiente e URL de suporte', () => {
    const env = parseLoginEnv({
      NEXT_PUBLIC_AMBIENTE: ' Homologação ',
      NEXT_PUBLIC_SUPORTE_URL: 'https://apsen.service-now.com',
    });
    expect(env.ambiente).toBe('Homologação');
    expect(env.suporteUrl).toBe('https://apsen.service-now.com');
    expect(() => parseLoginEnv({ NEXT_PUBLIC_SUPORTE_URL: 'x' })).toThrow(
      'NEXT_PUBLIC_SUPORTE_URL',
    );
  });

  it('normaliza a URL informada', () => {
    expect(parseEnv({ NEXT_PUBLIC_API_URL: ' https://api.exemplo.com/v1/ ' }).apiUrl).toBe(
      'https://api.exemplo.com/v1',
    );
  });

  it('rejeita URL inválida', () => {
    const source = { NEXT_PUBLIC_API_URL: 'nao-e-url' };
    expect(() => parseEnv(source)).toThrow(InvalidEnvError);
    expect(() => parseEnv(source)).toThrow('NEXT_PUBLIC_API_URL');
  });

  it.each([
    [{ NEXT_PUBLIC_AUTH_MODE: 'entra' }, 'entra'],
    [{ NEXT_PUBLIC_AUTH_MODE: 'simulado' }, 'simulado'],
    [{ NODE_ENV: 'development' }, 'simulado'],
    [{ NODE_ENV: 'production' }, 'entra'],
    [{ NODE_ENV: 'production', NEXT_PUBLIC_AUTH_MODE: 'simulado' }, 'entra'],
  ])('modo de autenticação com %p → %s', (source, esperado) => {
    expect(parseEnv(source).authMode).toBe(esperado);
  });

  it('aceita só simulado/entra', () => {
    expect(() => parseEnv({ NEXT_PUBLIC_AUTH_MODE: 'sso' })).toThrow('NEXT_PUBLIC_AUTH_MODE');
  });
});

describe('readProcessEnv', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('lê as variáveis públicas e o NODE_ENV', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.exemplo.com';
    process.env.NEXT_PUBLIC_AUTH_MODE = 'entra';
    process.env.NEXT_PUBLIC_AMBIENTE = 'Produção';
    expect(readProcessEnv()).toEqual({
      NEXT_PUBLIC_AMBIENTE: 'Produção',
      NEXT_PUBLIC_SUPORTE_URL: process.env.NEXT_PUBLIC_SUPORTE_URL,
      NEXT_PUBLIC_API_URL: 'https://api.exemplo.com',
      NEXT_PUBLIC_AUTH_MODE: 'entra',
      NODE_ENV: process.env.NODE_ENV,
    });
  });
});
